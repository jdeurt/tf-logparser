# tf-logparser

A TypeScript parser for Team Fortress 2 server logs. Parses raw TF2 log files into typed, structured event objects using a [Peggy](https://peggyjs.org/) grammar.

## Usage

```ts
import { parseLog } from "tf-logparser";
import type { TfLogEvent } from "tf-logparser";

const raw = fs.readFileSync("match.log", "utf-8");
const events: TfLogEvent[] = parseLog(raw);
```

Every event includes a `timestamp` (ms since epoch) and the original `raw` log line. Events are discriminated by the `type` field, so you can narrow with a simple check:

```ts
for (const event of events) {
  if (event.type === "kill") {
    console.log(`${event.player.name} killed ${event.victim.name} with ${event.weapon}`);
  }
}
```

## Log format spec

Each line in a TF2 server log follows this structure:

```
L MM/DD/YYYY - HH:MM:SS: <event data>
```

### Player format

Players are encoded as:

```
"<name><<entityId>><<steamId>><<team>>"
```

For example: `"Frank<52><[U:1:156276611]><Red>"`

Parsed into:

```ts
interface Player {
  name: string;
  entityId: number;
  steamId: string;
  team: string;
}
```

### Supported event types

The parser recognizes the following events. Any line that doesn't match a known pattern is returned as an `unknown` event.

#### Combat

| Type | Description |
|---|---|
| `damage` | Player damaged another player. Includes damage, realdamage, weapon, and optional crit/mini, headshot, airshot, height, healing fields. |
| `kill` | Player killed another player. Includes weapon, optional customkill, and attacker/victim positions. |
| `killAssist` | Player assisted a kill. Includes assister, attacker, and victim positions. |
| `suicide` | Player killed themselves. Includes weapon and position. |
| `medicDeath` | Medic was killed. Includes healing given and ubercharge percentage lost. |
| `medicDeathEx` | Extended medic death info with uber percentage. |
| `playerExtinguished` | Player extinguished a burning teammate. |
| `shotFired` | Player fired a weapon. |
| `shotHit` | Player's shot hit a target. |

#### Healing & Ubercharge

| Type | Description |
|---|---|
| `healed` | Medic healed a target. Includes healing amount, optional airshot and height. |
| `chargeReady` | Medigun charge is ready. |
| `chargeDeployed` | Ubercharge deployed. Includes medigun type. |
| `chargeEnded` | Ubercharge ended. Includes duration in seconds. |
| `emptyUber` | Ubercharge fully depleted. |
| `firstHealAfterSpawn` | Time of first heal after medic spawned. |
| `lostUberAdvantage` | Medic lost uber advantage. Includes time in seconds. |

#### Objectives

| Type | Description |
|---|---|
| `pointCaptured` | Team captured a control point. Includes cp index, name, number of cappers, and per-player positions. |
| `captureBlocked` | Player blocked a capture. Includes cp index, name, and position. |

#### Buildings & Objects

| Type | Description |
|---|---|
| `playerBuiltObject` | Player built an object (sentry, dispenser, etc). |
| `killedObject` | Player destroyed an object. Includes weapon, object owner, optional assist info. |
| `objectDetonated` | Player detonated their own object. |
| `playerCarryObject` | Player picked up their building. |
| `playerDropObject` | Player dropped their building. |

#### Round & Game

| Type | Description |
|---|---|
| `roundStart` | Round started. |
| `roundSetupBegin` | Setup phase began. |
| `roundSetupEnd` | Setup phase ended. |
| `roundWin` | Round won by a team. |
| `roundLength` | Round duration in seconds. |
| `roundOvertime` | Overtime started. |
| `gameOver` | Game ended with a reason string. |
| `currentScore` | Mid-game score report (team, score, numPlayers). |
| `finalScore` | End-of-game score report. |
| `intermissionWinLimit` | Intermission or win limit reached. |

#### Player State

| Type | Description |
|---|---|
| `spawned` | Player spawned as a class/role. |
| `spawnedMFilter` | Player spawned with m_filter (optional role). |
| `changedRole` | Player changed class. |
| `changedName` | Player changed their name. |
| `chargedMFilter` | Player charged as role with m_filter. |
| `pickedUpItem` | Player picked up an item (optional healing value). |
| `joinedTeam` | Player joined a team. |
| `connected` | Player connected to the server. |
| `enteredGame` | Player entered the game. |
| `positionReport` | Player position report. |

#### Domination & Revenge

| Type | Description |
|---|---|
| `domination` | Player is dominating another. Optional assist flag. |
| `revenge` | Player got revenge. Optional assist flag. |

#### Chat

| Type | Description |
|---|---|
| `say` | Public chat message. |
| `sayTeam` | Team chat message. |

#### Pause

| Type | Description |
|---|---|
| `matchPause` | Player triggered a pause. |
| `matchUnpause` | Player triggered an unpause. |
| `gamePaused` | Game is paused. |
| `gameUnpaused` | Game is unpaused. |
| `pauseLength` | Pause duration in seconds. |

#### Passtime

| Type | Description |
|---|---|
| `passGet` | Player got the ball. Includes firstcontact flag and position. |
| `passFree` | Ball became free. |
| `passPassCaught` | Pass was caught. Includes interception, save, handoff flags, distance, duration, and positions. |
| `passScore` | Player scored. Includes points, panacea, winStrat, deathbomb flags, distance, and position. |
| `passScoreAssist` | Player assisted a score. |
| `passBallStolen` | Ball was stolen. Includes stealDefense flag and positions. |
| `catapult` | Player used a catapult. |
| `passtimeBallSpawned` | Ball spawned at a location. |
| `passtimeBallDamage` | Ball took damage. |
| `panaceaCheck` | Panacea check event. |

#### Meta

Meta lines are post-processing artifacts added by external tools. They use the standard timestamp prefix (typically all zeros) with the format:

```
L 00/00/0000 - 00:00:00: # <LABEL> [(key "value1" "value2") (flag)]
```

| Type | Description |
|---|---|
| `meta` | Meta line with a label and optional key-value pairs. `kvs` is a `Record<string, string[] \| true>` where flags (no values) are `true`. |

#### System

| Type | Description |
|---|---|
| `demosTf` | Message from the demos.tf plugin. |
| `printingForClient` | Server printing for a client. |
| `unknown` | Unrecognized log line (fallback). |

## Benchmarks

Measured on real match logs (median of 20 runs after 3 warmup runs):

| Fixture        |   Size |  Lines |   Time |  Lines/sec |
|----------------|-------:|-------:|-------:|-----------:|
| cp.log         | 1601 KB | 12,692 | 151.1 ms |    83,985 |
| koth.log       | 1147 KB |  8,519 |  90.5 ms |    94,089 |
| passtime.log   | 1246 KB | 10,260 | 185.8 ms |    55,228 |
| payload.log    | 1463 KB | 11,066 | 134.8 ms |    82,102 |
| ultiduo.log    |  285 KB |  2,172 |  25.4 ms |    85,614 |

Run benchmarks yourself with:

```bash
npm run build:parser && npx tsx scripts/benchmark.ts
```

## Tested game modes

The parser is tested against real log fixtures for:

- Control Points (5CP)
- King of the Hill
- Payload
- Passtime
- Ultiduo

## Development

```bash
npm run build          # Generate parser + compile TypeScript
npm test               # Build parser + run tests
npm run test:watch     # Run tests in watch mode
npm run lint           # Lint source
npm run format         # Format with Prettier
```

## License

ISC
