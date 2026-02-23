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
