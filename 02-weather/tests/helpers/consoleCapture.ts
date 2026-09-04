import { spyOn } from "bun:test";
import { stripAnsi } from "./fixtures.ts";

export function captureLog(fn: () => void): string[] {
  const log = spyOn(console, "log");
  try {
    fn();
    return log.mock.calls.map((call) => stripAnsi(String(call[0] ?? "")));
  } finally {
    log.mockRestore();
  }
}

export async function captureLogAsync(fn: () => Promise<void>): Promise<string[]> {
  const log = spyOn(console, "log");
  try {
    await fn();
    return log.mock.calls.map((call) => stripAnsi(String(call[0] ?? "")));
  } finally {
    log.mockRestore();
  }
}
