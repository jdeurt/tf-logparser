import type { RawTfLogEvent } from "../types/index.js";
import type { TeamInfo, TeamColorPeriod } from "../types/index.js";

type TeamColor = "Red" | "Blue";

function isTeamColor(value: string): value is TeamColor {
  return value === "Red" || value === "Blue";
}

/** Return the player's effective color from an event, or null. */
function getEventPlayerColor(event: RawTfLogEvent): TeamColor | null {
  if (event.type === "joinedTeam") {
    return isTeamColor(event.newTeam) ? event.newTeam : null;
  }
  if ("player" in event) {
    return isTeamColor(event.player.team) ? event.player.team : null;
  }
  return null;
}

function getEventPlayerSteamId(event: RawTfLogEvent): string | null {
  if ("player" in event) {
    return event.player.steamId;
  }
  return null;
}

/**
 * Detect timestamps where teams swap colors.
 * A swap is a batch of JoinedTeamEvents at the same timestamp after a
 * RoundWinEvent, where multiple players switch between Red and Blue.
 */
function detectSwaps(events: RawTfLogEvent[]): number[] {
  const swaps: number[] = [];
  let sawRoundWin = false;
  let processedBatchTs: number | null = null;

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as RawTfLogEvent;

    if (event.type === "roundWin") {
      sawRoundWin = true;
      processedBatchTs = null;
      continue;
    }

    if (sawRoundWin && event.type === "joinedTeam") {
      if (event.timestamp === processedBatchTs) continue;

      const batchTs: number = event.timestamp;
      let switchCount = 0;

      for (let j = i; j < events.length; j++) {
        const e = events[j] as RawTfLogEvent;
        if (e.timestamp !== batchTs) break;
        if (e.type === "joinedTeam") {
          if (
            (e.player.team === "Red" && e.newTeam === "Blue") ||
            (e.player.team === "Blue" && e.newTeam === "Red")
          ) {
            switchCount++;
          }
        }
      }

      processedBatchTs = batchTs;

      if (switchCount >= 2) {
        swaps.push(batchTs);
        sawRoundWin = false;
      }
    }
  }

  return swaps;
}

/**
 * Analyze events to detect the two teams and their color assignments over time.
 *
 * In TF2 payload logs, teams swap colors between rounds. This function
 * detects those swaps and groups players into stable teams, tracking each
 * team's color assignment periods.
 */
export function groupTeams(events: RawTfLogEvent[]): TeamInfo[] {
  const swapTimestamps = detectSwaps(events);

  const redTeam = new Set<string>();
  const blueTeam = new Set<string>();
  const assigned = new Set<string>();

  let swapCount = 0;
  let swapIdx = 0;

  for (const event of events) {
    // Advance swap counter when we reach a swap timestamp
    while (
      swapIdx < swapTimestamps.length &&
      event.timestamp >= (swapTimestamps[swapIdx] as number)
    ) {
      swapCount++;
      swapIdx++;
    }

    const color = getEventPlayerColor(event);
    const steamId = getEventPlayerSteamId(event);
    if (color && steamId && !assigned.has(steamId)) {
      // Map current color back to initial color based on swap parity
      const initialColor: TeamColor =
        swapCount % 2 === 0 ? color : color === "Red" ? "Blue" : "Red";

      if (initialColor === "Red") {
        redTeam.add(steamId);
      } else {
        blueTeam.add(steamId);
      }
      assigned.add(steamId);
    }
  }

  const firstTs =
    events.length > 0 ? (events[0] as RawTfLogEvent).timestamp : 0;
  const result: TeamInfo[] = [];

  for (const [initialColor, steamIds] of [
    ["Red", redTeam],
    ["Blue", blueTeam],
  ] as const) {
    if (steamIds.size === 0) continue;

    const colors: TeamColorPeriod[] = [{ color: initialColor, start: firstTs }];
    let currentColor: TeamColor = initialColor;

    for (const swapTs of swapTimestamps) {
      currentColor = currentColor === "Red" ? "Blue" : "Red";
      colors.push({ color: currentColor, start: swapTs });
    }

    result.push({
      playerSteamIds: [...steamIds].sort(),
      colors,
    });
  }

  return result;
}
