import { readFileSync, readdirSync } from "fs";
import { parseLog } from "../src/parser/index.js";

const WARMUP_RUNS = 3;
const BENCH_RUNS = 20;

const fixtures = readdirSync("fixtures")
  .filter((f) => f.endsWith(".log"))
  .sort();

for (const file of fixtures) {
  const raw = readFileSync(`fixtures/${file}`, "utf-8");
  const lines = raw.split("\n").filter((l) => l.length > 0).length;
  const sizeKB = (Buffer.byteLength(raw) / 1024).toFixed(0);

  // Warmup
  for (let i = 0; i < WARMUP_RUNS; i++) parseLog(raw);

  // Bench
  const times: number[] = [];
  for (let i = 0; i < BENCH_RUNS; i++) {
    const start = performance.now();
    parseLog(raw);
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const linesPerSec = Math.round(lines / (median / 1000));

  console.log(
    `| ${file.padEnd(14)} | ${(sizeKB + " KB").padStart(8)} | ${String(lines).padStart(6)} | ${median.toFixed(1).padStart(8)} ms | ${linesPerSec.toLocaleString().padStart(10)} |`,
  );
}
