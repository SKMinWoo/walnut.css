/* A function-calling loop against Google Gemini's REST API. The agent brings
   its system prompt and tools; this runs the conversation until a tool says
   the job is done, the model stops calling tools, or the turn budget runs
   out.

   Plain fetch rather than an SDK: one endpoint, one request shape, no
   dependency in a repo that has none. Every transport or API failure is
   thrown as GeminiUnavailable, so the caller can fall back to the rules
   director and say so.

   The leading underscore keeps Vercel from serving this file as a function. */

export class GeminiUnavailable extends Error {
  /** Busy, rate-limited or unreachable: worth another try, unlike a rejected request. */
  constructor(message, transient = false, status) {
    super(message);
    this.transient = transient;
    this.status = status;
  }
}

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
/** Fast and inexpensive; override with GEMINI_MODEL. */
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const TURN_TIMEOUT_MS = 15_000;
/* Waits before each retry of a transient failure (503 busy, 429 rate
   limited, a dropped connection), with jitter. A timeout is not retried: the
   reader has already waited long enough. */
const RETRY_DELAYS_MS = [700, 2000];
/* Asked in turn when the main model is busy or not served to this key, and
   only before the first reply: later turns carry the first model's thought
   signatures, which another model need not accept. GEMINI_FALLBACK_MODELS
   overrides the list (comma-separated), and "none" turns it off. */
const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
/** The cascade stops trying new models after this, so a reader never waits long for the rules director. */
const CASCADE_BUDGET_MS = 20_000;

const isTransientStatus = (status) => status === 408 || status === 429 || status >= 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fallbackModels(primary) {
  const env = process.env.GEMINI_FALLBACK_MODELS?.trim();
  if (env === "none") return [];
  const list = env ? env.split(",").map((m) => m.trim()).filter(Boolean) : FALLBACK_MODELS;
  return list.filter((m, i) => m !== primary && list.indexOf(m) === i);
}

/* GEMINI_API_KEY is the documented name; the names Google's own SDKs read
   are accepted too, so a key added under either still switches the model on. */
const geminiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || undefined;
export const geminiConfigured = () => Boolean(geminiKey());

async function generate(model, key, system, tools, contents, temperature) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TURN_TIMEOUT_MS);
  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        tools: [{ functionDeclarations: tools.map((t) => t.declaration) }],
        toolConfig: { functionCallingConfig: { mode: "AUTO" } },
        generationConfig: { temperature, maxOutputTokens: 1024 },
      }),
      signal: ctrl.signal,
    });
    // Status only: the body can echo request details, and none of it belongs in a public trace.
    if (!res.ok) throw new GeminiUnavailable(`Gemini returned HTTP ${res.status}`, isTransientStatus(res.status), res.status);
    const content = (await res.json()).candidates?.[0]?.content;
    if (!content?.parts?.length) throw new GeminiUnavailable("Gemini returned no content");
    return { role: "model", parts: content.parts };
  } catch (e) {
    if (e instanceof GeminiUnavailable) throw e;
    throw ctrl.signal.aborted ? new GeminiUnavailable("Gemini timed out") : new GeminiUnavailable("Gemini could not be reached", true);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(fn, delays, onRetry) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= delays.length || !(e instanceof GeminiUnavailable && e.transient)) throw e;
      const wait = Math.round(delays[attempt] * (0.75 + Math.random() * 0.5));
      onRetry?.(e, wait);
      await sleep(wait);
    }
  }
}

/**
 * Run the agent. `tools` is a list of { declaration, run(args) }, where run
 * returns { response, done? }; its arguments come from the model and are
 * untrusted. `onNote` hears about retries and fallback models, for the trace.
 */
export async function runGeminiAgent({ system, input, tools, maxTurns = 8, temperature = 0.8, onNote }) {
  const key = geminiKey();
  if (!key) throw new GeminiUnavailable("No GEMINI_API_KEY configured");
  let model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const byName = new Map(tools.map((t) => [t.declaration.name, t]));
  const contents = [{ role: "user", parts: [{ text: input }] }];

  for (let turn = 1; turn <= maxTurns; turn++) {
    // The first turn may move down the cascade; once a model has replied, the
    // conversation stays with it. Each fallback gets one ask: the next model is the retry.
    const candidates = turn === 1 ? [model, ...fallbackModels(model)] : [model];
    const started = Date.now();
    let reply;
    for (const [i, m] of candidates.entries()) {
      try {
        reply = await withRetry(() => generate(m, key, system, tools, contents, temperature), i === 0 ? RETRY_DELAYS_MS : [],
          (e, ms) => onNote?.(`${m}: ${e.message}; retrying in ${(ms / 1000).toFixed(1)}s`));
        model = m;
        break;
      } catch (e) {
        const next = candidates[i + 1];
        const another = e instanceof GeminiUnavailable && (e.transient || e.status === 404);
        if (!next || !another) throw e;
        if (Date.now() - started > CASCADE_BUDGET_MS) {
          onNote?.(`${m}: ${e.message}; stopped asking after ${CASCADE_BUDGET_MS / 1000}s`);
          throw e;
        }
        onNote?.(`${m}: ${e.message}; asking ${next}`);
      }
    }
    // The model's turn goes back exactly as received, thought signatures and all.
    contents.push(reply);

    const calls = reply.parts.filter((p) => p.functionCall).map((p) => p.functionCall);
    if (!calls.length) return { finished: false, turns: turn };

    const responses = [];
    let done = false;
    for (const call of calls) {
      const tool = byName.get(call.name);
      const out = tool ? await tool.run(call.args ?? {}) : { response: { error: `Unknown tool ${call.name}` } };
      done ||= Boolean(out.done);
      responses.push({ functionResponse: { name: call.name, response: out.response, ...(call.id ? { id: call.id } : {}) } });
    }
    if (done) return { finished: true, turns: turn };
    contents.push({ role: "user", parts: responses });
  }
  return { finished: false, turns: maxTurns };
}
