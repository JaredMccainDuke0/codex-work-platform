#!/usr/bin/env node
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";
import { PRODUCT_VERSION } from "../version.mjs";

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
        product: { version: PRODUCT_VERSION, manifestShortHash: "e2e" },
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
    colorScheme: "dark",
  });
  const environmentPayload = (verified) => ({
    ok: true,
    workspaceRoot: temp,
    allowedRoots: [temp],
    adapters: [
      { adapter: "mock", available: true, authenticated: true },
      {
        adapter: "local-codex-cli",
        available: true,
        authenticated: true,
        provider: { name: "openai", label: "OpenAI official" },
        capabilities: { executionVerified: verified },
      },
      {
        adapter: "local-codex-app-server",
        available: verified,
        authenticated: true,
        capabilities: { executionVerified: verified },
        reason: verified ? null : "CODEX_APP_SERVER_UNAVAILABLE",
      },
    ],
  });
  await page.route("**/api/p10/codex/status*", async (route) => {
    const verify =
      new URL(route.request().url()).searchParams.get("verify") === "1";
    if (verify) await sleep(16_000);
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(environmentPayload(verify)),
    });
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${webPort}/`, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "Your first local workflow" })
    .waitFor();
  if ((await page.locator("#run-adapter").inputValue()) !== "local-codex-cli")
    throw Error("E2E_APP_SERVER_FALLBACK_MISSING");
  if (
    !(await page
      .locator('#run-adapter option[value="local-codex-app-server"]')
      .evaluate((option) => option.disabled))
  )
    throw Error("E2E_UNAVAILABLE_APP_SERVER_NOT_DISABLED");
  await page.getByRole("button", { name: "Verify now" }).click();
  await page
    .getByText("CLI and App Server are ready.", { exact: true })
    .first()
    .waitFor({ timeout: 30_000 });
  if (
    (await page
      .getByRole("button", { name: "Overview" })
      .getAttribute("aria-current")) !== "page"
  )
    throw Error("E2E_OVERVIEW_ARIA_CURRENT_MISSING");
  await page.getByRole("button", { name: "切换到中文" }).click();
  await page.getByRole("heading", { name: "工作台总览" }).waitFor();
  await page.getByRole("link", { name: "跳到主要内容" }).waitFor();
  if ((await page.locator("html").getAttribute("lang")) !== "zh-CN")
    throw Error("E2E_CHINESE_LANG_MISSING");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("heading", { name: "Workbench overview" }).waitFor();
  await page.getByRole("button", { name: "Workflows 0" }).click();
  await page.getByText("Advanced execution options").first().waitFor();
  await page.locator("#workflow-title").fill("E2E workflow");
  await page.locator("#workflow-description").fill("Browser regression flow");
  await page
    .getByRole("button", { name: "Create workflow", exact: true })
    .click();
  await page.getByText("E2E workflow", { exact: true }).last().waitFor();
  const nodes = [
    ["Inspect", "Inspect the temporary project without changing files."],
    ["Report", "Return a concise verification report."],
  ];
  for (const [index, [title, prompt]] of nodes.entries()) {
    await page.locator("#node-title").fill(title);
    await page.locator("#node-prompt").fill(prompt);
    await page.getByRole("button", { name: "Add node", exact: true }).click();
    await page.locator(".order-item").nth(index).waitFor();
  }
  const orderSlotCount = await page.locator(".order-item").count();
  if (orderSlotCount !== 2)
    throw Error(`E2E_ORDER_SLOT_COUNT:${orderSlotCount}`);
  await page.getByRole("button", { name: "Move down 1" }).click();
  await page.getByText("Order changed; not saved", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Save order", exact: true }).click();
  await page.getByText("Order saved", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Approvals 0" }).click();
  await page.getByRole("heading", { name: "Approval center" }).waitFor();
  await page.getByRole("button", { name: "Projects" }).click();
  await page.getByRole("heading", { name: "Projects and briefs" }).waitFor();
  const newProject = page.getByRole("button", { name: "New project" });
  if ((await newProject.getAttribute("aria-expanded")) !== "false")
    throw Error("E2E_PROJECT_FORM_INITIAL_STATE");
  await newProject.click();
  await page.locator("#project-form").waitFor();
  if ((await newProject.getAttribute("aria-expanded")) !== "true")
    throw Error("E2E_PROJECT_FORM_EXPANDED_STATE");
  await newProject.click();
  if ((await newProject.getAttribute("aria-expanded")) !== "false")
    throw Error("E2E_PROJECT_FORM_COLLAPSED_STATE");
  await page.getByRole("button", { name: "Activity" }).click();
  await page.getByRole("heading", { name: "Activity and audit" }).waitFor();
  if (
    (await page
      .getByRole("button", { name: "Activity" })
      .getAttribute("aria-current")) !== "page"
  )
    throw Error("E2E_ACTIVITY_ARIA_CURRENT_MISSING");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:${webPort}/#overview`, {
    waitUntil: "networkidle",
  });
  const metrics = await page.evaluate(() => ({
    title: document.title,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    panelBackground: getComputedStyle(document.querySelector(".panel"))
      .backgroundColor,
    transcriptBackground: getComputedStyle(
      document.querySelector(".transcript"),
    ).backgroundColor,
    shellWidth: document
      .querySelector(".content-column")
      ?.getBoundingClientRect().width,
  }));
  if (errors.length) throw Error(`E2E_CONSOLE_ERRORS:${errors.join(" | ")}`);
  if (metrics.scrollWidth > metrics.innerWidth)
    throw Error(`E2E_HORIZONTAL_OVERFLOW:${JSON.stringify(metrics)}`);
  if (metrics.colorScheme !== "light")
    throw Error(`E2E_NOT_LIGHT_THEME:${JSON.stringify(metrics)}`);
  if (metrics.panelBackground !== "rgb(255, 255, 255)")
    throw Error(`E2E_PANEL_NOT_LIGHT:${JSON.stringify(metrics)}`);
  if (metrics.transcriptBackground !== "rgb(244, 250, 255)")
    throw Error(`E2E_TRANSCRIPT_NOT_LIGHT:${JSON.stringify(metrics)}`);
  console.log(JSON.stringify({ ok: true, metrics }));
  await browser.close();
} finally {
  child.kill();
  await new Promise((resolve) => child.once("exit", resolve));
  await new Promise((resolve) => compat.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
