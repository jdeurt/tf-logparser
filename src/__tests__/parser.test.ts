import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";
import { parseLog } from "../parser.js";

const fixturesDir = join(__dirname, "../../fixtures");

function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), "utf-8");
}

function nonEmptyLineCount(text: string): number {
  return text.split("\n").filter((line) => line.length > 0).length;
}

function findLogs(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      results.push(...findLogs(join(dir, entry.name)));
    } else if (entry.name.endsWith(".log")) {
      results.push(relative(fixturesDir, join(dir, entry.name)));
    }
  }
  return results.sort();
}

const fixtures = findLogs(fixturesDir);

describe.each(fixtures)("%s", (fixture) => {
  const raw = loadFixture(fixture);
  const events = parseLog(raw);

  it("parses every non-empty line", () => {
    expect(events.length).toBe(nonEmptyLineCount(raw));
  });

  it("has zero unknown events", () => {
    const unknowns = events.filter((e) => e.type === "unknown");
    if (unknowns.length > 0) {
      // Deduplicate by pattern (strip specific values)
      const patterns = new Set(unknowns.map((e) => e.raw));
      const sample = [...patterns].slice(0, 20);
      console.log(
        `Unknown events (${String(unknowns.length)} total, showing up to 20 unique):`,
      );
      for (const s of sample) {
        console.log(`  ${s}`);
      }
    }
    expect(unknowns).toHaveLength(0);
  });

  it("every event has a timestamp and raw field", () => {
    for (const event of events) {
      expect(typeof event.timestamp).toBe("number");
      expect(typeof event.raw).toBe("string");
      expect(event.raw.length).toBeGreaterThan(0);
    }
  });
});
