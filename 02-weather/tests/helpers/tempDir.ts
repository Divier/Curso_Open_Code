import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let previousCwd: string | undefined;
let createdDir: string | undefined;

export function enterTempDir(): string {
  previousCwd = process.cwd();
  createdDir = mkdtempSync(join(tmpdir(), "weather-tests-"));
  process.chdir(createdDir);
  return createdDir;
}

export function exitTempDir(): void {
  if (previousCwd !== undefined) process.chdir(previousCwd);
  if (createdDir !== undefined) rmSync(createdDir, { recursive: true, force: true });
  previousCwd = undefined;
  createdDir = undefined;
}
