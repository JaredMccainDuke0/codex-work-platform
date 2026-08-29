#!/usr/bin/env node
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";

const root = path.resolve(import.meta.dirname, "..");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const temp = await mkdtemp(path.join(os.tmpdir(), "cwp-e2e-"));
const compat = http.createServer((req, res) => {
  if (req.url === "/healthz") return res.end(JSON.stringify({ ok: true }));
  if (req.url?.startsWith("/api/status"))
    return res.end(
      JSON.stringify({
        ok: true,
        projects: [],
        candidates: [],
        recentEvents: [],
        pages: { projects: {} },
        projectCount: 0,
        workItemCount: 0,
        candidateCount: 0,
        eventCount: 0,
        product: { version: "1.0.0", manifestShortHash: "e2e" },
        generatedAt: new Date().toISOString(),
      }),
    );
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: false, code: "NOT_FOUND" }));
});
await new Promise((resolve) => compat.listen(0, "127.0.0.1", resolve));
const compatPort = compat.address().port;
const webPort = await new Promise((resolve) => {
  const server = http.createServer();
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close(() => resolve(port));
  });
});
const requestToken = crypto.randomBytes(16).toString("hex");
const child = spawn(
  process.execPath,
  [
    "--experimental-sqlite",
    path.join(root, "p10-control-server.mjs"),
    "--db",
    path.join(temp, "platform.sqlite"),
    "--control-db",
    path.join(temp, "control.sqlite"),
    "--port",
    String(webPort),
    "--compat-base",
    `http://127.0.0.1:${compatPort}`,
    "--workspace-root",
    temp,
    "--request-token",
    requestToken,
  ],
  { cwd: root, windowsHide: true, stdio: "ignore" },
);
try {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      if ((await fetch(`http://127.0.0.1:${webPort}/healthz`)).ok) break;
    } catch {}
    await sleep(100);
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${webPort}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "切换到中文" }).click();
  await page.getByRole("heading", { name: "工作台总览" }).waitFor();
  await page.evaluate(() => localStorage.setItem("cwp-locale", "en"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Workflows 0" }).click();
  await page.getByText("Advanced execution options").first().waitFor();
  await page.getByRole("button", { name: "Projects" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:${webPort}/`, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => ({
    title: document.title,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    shellWidth: document
      .querySelector(".content-column")
      ?.getBoundingClientRect().width,
  }));
  if (errors.length) throw Error(`E2E_CONSOLE_ERRORS:${errors.join(" | ")}`);
  if (metrics.scrollWidth > metrics.innerWidth)
    throw Error(`E2E_HORIZONTAL_OVERFLOW:${JSON.stringify(metrics)}`);
  console.log(JSON.stringify({ ok: true, metrics }));
  await browser.close();
} finally {
  child.kill();
  await new Promise((resolve) => child.once("exit", resolve));
  await new Promise((resolve) => compat.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
