/**
 * Static dev server for Micro Viewer (port 4001)
 * Fix: never call writeHead twice; set headers once, then pipe stream.
 * Default route -> /public/index.s6.html
 */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 4001;

// Resolve repo root assuming this file lives at packages/micro-viewer/server.mjs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname); // .../packages/micro-viewer

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

function contentType(p) {
  const ext = path.extname(p).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath);
  // normalize and prevent path traversal
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return path.join(root, normalized);
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url || '/', `http://${host}`);
    let pathname = url.pathname;

    // Default route to S6 demo page
    if (pathname === '/' || pathname === '/public/' || pathname === '/index.html') {
      pathname = '/public/index.s6.html';
    }

    // Map URL to filesystem under packages/micro-viewer
    const filePath = safeJoin(ROOT, pathname);

    // Ensure we only serve inside ROOT
    if (!filePath.startsWith(ROOT)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    const st = await stat(filePath).catch(() => null);
    if (!st) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    if (st.isDirectory()) {
      res.statusCode = 403;
      res.end('Directory listing is disabled');
      return;
    }

    // Write headers once, then pipe
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType(filePath));
    res.setHeader('Cache-Control', 'no-cache');

    const stream = createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
      res.end('Stream error');
    });
    stream.pipe(res);
  } catch (err) {
    try {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
    } finally {
      res.end('Internal Server Error');
    }
  }
});

server.listen(PORT, () => {
  console.log(`[micro-viewer] Dev server listening on http://localhost:${PORT}/public/index.s6.html`);
});
