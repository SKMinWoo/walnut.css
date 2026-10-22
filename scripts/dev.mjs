/* The docs site as Vercel serves it, on one machine: public/ as static files
   and api/*.mjs as functions, called with a Web Request the way Vercel calls
   them. No dependencies.

     npm run dev                         http://localhost:5059
     PORT=5077 npm run dev
     node --env-file=.env scripts/dev.mjs   with GEMINI_API_KEY, for the model */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 5059;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json",
};

async function api(req, res, name) {
  const file = path.join(ROOT, "api", `${name}.mjs`);
  if (name.startsWith("_") || !(await stat(file).catch(() => null))) return false;
  const mod = await import(pathToFileURL(file).href);
  const handler = mod[req.method];
  if (!handler) { res.writeHead(405).end(); return true; }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const url = `http://${req.headers.host}${req.url}`;
  const headers = new Headers(Object.entries(req.headers).flatMap(([k, v]) => (v === undefined ? [] : [[k, String(v)]])));
  headers.set("x-real-ip", req.socket.remoteAddress ?? "local");
  const response = await handler(new Request(url, { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined }));
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
  return true;
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://x");
    const fn = pathname.match(/^\/api\/([\w-]+)$/);
    if (fn && (await api(req, res, fn[1]))) return;
    let file = path.join(PUBLIC, decodeURIComponent(pathname));
    if (!file.startsWith(PUBLIC)) return res.writeHead(403).end();
    if ((await stat(file).catch(() => null))?.isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file).catch(() => null);
    if (!body) return res.writeHead(404).end("Not found");
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" }).end(body);
  } catch (e) {
    console.error(e);
    res.writeHead(500).end();
  }
}).listen(PORT, () => console.log(`walnut docs and api on http://localhost:${PORT}`));
