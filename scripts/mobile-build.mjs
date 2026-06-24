import { rename, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const tempDir = path.join(rootDir, ".mobile-build-temp");

const disabledEntries = [
  {
    source: path.join(rootDir, "src", "middleware.ts"),
    backup: path.join(tempDir, "src", "middleware.ts"),
  },
  {
    source: path.join(rootDir, "src", "app", "api"),
    backup: path.join(tempDir, "src", "app", "api"),
  },
];

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function disableServerOnlyEntries() {
  await rm(tempDir, { recursive: true, force: true });
  await rm(path.join(rootDir, ".next"), { recursive: true, force: true });
  await rm(path.join(rootDir, "out"), { recursive: true, force: true });

  for (const entry of disabledEntries) {
    if (!(await exists(entry.source))) continue;
    await mkdir(path.dirname(entry.backup), { recursive: true });
    await rename(entry.source, entry.backup);
  }
}

async function restoreServerOnlyEntries() {
  for (const entry of disabledEntries) {
    if (!(await exists(entry.backup))) continue;
    await mkdir(path.dirname(entry.source), { recursive: true });
    if (await exists(entry.source)) {
      await rm(entry.source, { recursive: true, force: true });
    }
    await rename(entry.backup, entry.source);
  }

  await rm(tempDir, { recursive: true, force: true });
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["./node_modules/next/dist/bin/next", "build"],
      {
        cwd: rootDir,
        stdio: "inherit",
        env: {
          ...process.env,
          NEXT_PUBLIC_APP_TARGET: "mobile",
          NEXT_PUBLIC_MOBILE_REDIRECT_URI:
            process.env.NEXT_PUBLIC_MOBILE_REDIRECT_URI ??
            "com.healthai.coach://auth/callback",
        },
      }
    );

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Mobile build failed with exit code ${code ?? -1}.`));
    });

    child.on("error", reject);
  });
}

try {
  await disableServerOnlyEntries();
  await runNextBuild();
} finally {
  await restoreServerOnlyEntries();
}
