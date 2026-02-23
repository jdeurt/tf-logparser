import { readFileSync, writeFileSync } from "node:fs";
import { parseLog } from "../src/parser.js";
import { dirname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const args = process.argv.slice(2);

let omitRaw = false;
const inputArgs: string[] = [];

for (const arg of args) {
  if (arg === "--omit-raw") {
    omitRaw = true;
  } else {
    inputArgs.push(arg);
  }
}

const [inputPath, outputPath] = inputArgs;

if (!inputPath || !outputPath) {
  console.error(
    "Usage: npx tsx scripts/stringify-log.ts <input.log> <output.log> [--omit-raw]",
  );
  process.exit(1);
}

// Ensure the output directory exists or create it
const outputDir = dirname(outputPath);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const raw = readFileSync(inputPath, "utf-8");
const events = parseLog(raw);

const output =
  events
    .map((e) => {
      if (omitRaw) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { raw, ...rest } = e;
        return JSON.stringify(rest);
      } else {
        return JSON.stringify(e);
      }
    })
    .join("\n") + "\n";

writeFileSync(outputPath, output);
console.log(
  `Wrote ${String(events.length)} events to ${outputPath}${omitRaw ? ' (omitted "raw" prop)' : ""}`,
);
