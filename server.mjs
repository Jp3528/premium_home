import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3050);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};
const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Método no permitido");
      return;
    }
    const path = decodeURIComponent(
      new URL(request.url, "http://127.0.0.1").pathname,
    );
    const file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
    if (
      !file.startsWith(root + sep) ||
      path.split("/").some((part) => part.startsWith("."))
    ) {
      response.writeHead(404);
      response.end("No encontrado");
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) {
      response.writeHead(404);
      response.end("No encontrado");
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("No encontrado");
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(`PremiumHome local: http://127.0.0.1:${port}`),
);
