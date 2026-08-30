import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

export function runDirectoryPicker({
  platform = process.platform,
  timeoutMs = 30_000,
} = {}) {
  if (platform === "win32") {
    const pickerRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-workbench-picker-"),
    );
    const scriptPath = path.join(pickerRoot, "pick.ps1");
    const resultPath = path.join(pickerRoot, "result.txt");
    const escapedResult = resultPath.replace(/'/g, "''");
    const script = `$ErrorActionPreference='Stop'; try { Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::EnableVisualStyles(); $d=New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description='选择 Codex 工作目录'; $d.ShowNewFolderButton=$true; if($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK){ Set-Content -LiteralPath '${escapedResult}' -Value $d.SelectedPath -Encoding UTF8 } else { Set-Content -LiteralPath '${escapedResult}' -Value '__CANCELLED__' -Encoding UTF8 } } catch { Set-Content -LiteralPath '${escapedResult}' -Value ('__ERROR__'+$_.Exception.Message) -Encoding UTF8 }`;
    fs.writeFileSync(scriptPath, script, { encoding: "utf8", mode: 0o600 });
    return new Promise((resolve, reject) => {
      const child = spawn(
        "powershell.exe",
        [
          "-NoProfile",
          "-STA",
          "-WindowStyle",
          "Normal",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          scriptPath,
        ],
        { windowsHide: false, detached: true, stdio: "ignore" },
      );
      child.unref();
      const startedAt = Date.now();
      let childExited = false;
      child.once("error", () => {
        childExited = true;
      });
      child.once("exit", () => {
        childExited = true;
      });
      const cleanup = () => {
        try {
          fs.rmSync(pickerRoot, { recursive: true, force: true });
        } catch {}
      };
      const poll = setInterval(() => {
        if (Date.now() - startedAt > timeoutMs) {
          clearInterval(poll);
          try {
            child.kill();
          } catch {}
          cleanup();
          reject(new Error("NATIVE_DIRECTORY_PICKER_TIMEOUT"));
          return;
        }
        if (!fs.existsSync(resultPath)) {
          if (childExited && Date.now() - startedAt > 1000) {
            clearInterval(poll);
            cleanup();
            reject(new Error("NATIVE_DIRECTORY_PICKER_LAUNCH_FAILED"));
          }
          return;
        }
        clearInterval(poll);
        const value = fs
          .readFileSync(resultPath, "utf8")
          .replace(/^\uFEFF/, "")
          .trim();
        cleanup();
        if (!value || value === "__CANCELLED__")
          reject(new Error("DIRECTORY_PICKER_CANCELLED"));
        else if (value.startsWith("__ERROR__"))
          reject(new Error(value.slice(9)));
        else resolve(value);
      }, 250);
    });
  }

  if (platform !== "darwin")
    return Promise.reject(new Error("NATIVE_DIRECTORY_PICKER_UNSUPPORTED"));
  return new Promise((resolve, reject) => {
    const child = spawn(
      "osascript",
      ["-e", 'POSIX path of (choose folder with prompt "选择 Codex 工作目录")'],
      { windowsHide: false, detached: true },
    );
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("NATIVE_DIRECTORY_PICKER_TIMEOUT"));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      const selected = stdout.trim();
      if (code === 0 && selected) resolve(selected);
      else reject(new Error(stderr.trim() || "DIRECTORY_PICKER_CANCELLED"));
    });
  });
}
