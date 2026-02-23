import type { RawTfLogEvent } from "./types.js";
import { parse } from "./generated/tf2-parser.js";

export function parseLog(rawText: string): RawTfLogEvent[] {
  const lines = rawText.split("\n").filter((line) => line.length > 0);
  const events: RawTfLogEvent[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    try {
      const event = parse(line) as RawTfLogEvent;
      event.lineNumber = i + 1;
      events.push(event);
    } catch {
      events.push({
        type: "unknown" as const,
        timestamp: Date.now(),
        lineNumber: i + 1,
        body: line,
      });
    }
  }
  return events;
}

export function combineLogs(logs: string[]): string {
  const ts = "01/01/0001 - 00:00:00";
  const sentinel = `L ${ts}: # COMBINED_LOG`;
  return logs.map((log) => log.trim()).join(`\n${sentinel}\n`);
}
