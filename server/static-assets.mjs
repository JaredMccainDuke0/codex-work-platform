import fs from "node:fs";
import path from "node:path";
import { sendJson } from "./http.mjs";
import { pathWithinRoot } from "./path-security.mjs";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

export function serveWebAsset({ res, webRoot, relativePath }) {
  const safe = String(relativePath || "").replaceAll("\\", "/");
  const absolute = path.resolve(webRoot, safe);
  if (
    !pathWithinRoot(absolute, webRoot) ||
    !fs.existsSync(absolute) ||
    !fs.statSync(absolute).isFile()
  )
    return sendJson(res, 404, { ok: false, code: "ASSET_NOT_FOUND" });
  res.writeHead(200, {
    "content-type":
      contentTypes[path.extname(absolute).toLowerCase()] ||
      "application/octet-stream",
    "cache-control": "no-cache",
    "x-content-type-options": "nosniff",
  });
  return res.end(fs.readFileSync(absolute));
}
