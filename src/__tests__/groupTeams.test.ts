import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseLog } from "../parser.js";
import { groupTeams } from "../analysis/groupTeams.js";

const fixturesDir = join(__dirname, "../../fixtures");

function loadFixture(name: string) {
  return readFileSync(join(fixturesDir, name), "utf-8");
}

describe("groupTeams", () => {
  describe("payload (has team swap)", () => {
    const events = parseLog(loadFixture("payload.log"));
    const teams = groupTeams(events);

    it("detects two teams", () => {
      expect(teams).toHaveLength(2);
    });

    it("each team has 2 color periods", () => {
      for (const team of teams) {
        expect(team.colors).toHaveLength(2);
      }
    });

    it("teams start on opposite colors", () => {
      const startColors = teams.map((t) => t.colors[0].color).sort();
      expect(startColors).toEqual(["Blue", "Red"]);
    });

    it("teams swap to opposite colors", () => {
      for (const team of teams) {
        expect(team.colors[0].color).not.toBe(team.colors[1].color);
      }
    });

    it("swap timestamps match", () => {
      // Both teams should have the same swap timestamp
      expect(teams[0].colors[1].start).toBe(teams[1].colors[1].start);
    });

    it("every team has players", () => {
      for (const team of teams) {
        expect(team.playerSteamIds.length).toBeGreaterThan(0);
      }
    });

    it("no player appears on both teams", () => {
      const allIds = teams.flatMap((t) => t.playerSteamIds);
      expect(new Set(allIds).size).toBe(allIds.length);
    });

    it("player steam IDs are sorted", () => {
      for (const team of teams) {
        const sorted = [...team.playerSteamIds].sort();
        expect(team.playerSteamIds).toEqual(sorted);
      }
    });
  });

  describe("koth (no team swap)", () => {
    const events = parseLog(loadFixture("koth.log"));
    const teams = groupTeams(events);

    it("detects two teams", () => {
      expect(teams).toHaveLength(2);
    });

    it("each team has 1 color period", () => {
      for (const team of teams) {
        expect(team.colors).toHaveLength(1);
      }
    });

    it("teams start on opposite colors", () => {
      const startColors = teams.map((t) => t.colors[0].color).sort();
      expect(startColors).toEqual(["Blue", "Red"]);
    });

    it("every team has players", () => {
      for (const team of teams) {
        expect(team.playerSteamIds.length).toBeGreaterThan(0);
      }
    });

    it("no player appears on both teams", () => {
      const allIds = teams.flatMap((t) => t.playerSteamIds);
      expect(new Set(allIds).size).toBe(allIds.length);
    });
  });
});
