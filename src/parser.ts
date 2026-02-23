import type { TfLogEvent } from "./types.js";
import { parse } from "./generated/tf2-parser.js";

export function parseLog(rawText: string): TfLogEvent[] {
  const lines = rawText.split("\n").filter((line) => line.length > 0);
  return lines.map((line) => {
    try {
      return parse(line) as TfLogEvent;
    } catch {
      return {
        type: "unknown" as const,
        timestamp: Date.now(),
        raw: line,
        body: line,
      };
    }
  });
}

export function combineLogs(logs: string[]): string {
  const ts = "01/01/0001 - 00:00:00";
  const sentinel = `L ${ts}: # COMBINED_LOG`;
  return logs.map((log) => log.trim()).join(`\n${sentinel}\n`);
}
