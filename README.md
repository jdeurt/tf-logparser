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
    console.log(
      `${event.player.name} killed ${event.victim.name} with ${event.weapon}`,
    );
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

| Type                 | Attributes                                                                                                     | Description                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `damage`             | `player`, `victim`, `damage`, `weapon`, `realdamage?`, `crit?`, `headshot?`, `airshot?`, `height?`, `healing?` | Player damaged another player.          |
| `kill`               | `player`, `victim`, `weapon`, `attackerPosition`, `victimPosition`, `customkill?`                              | Player killed another player.           |
| `killAssist`         | `player`, `victim`, `assisterPosition`, `attackerPosition`, `victimPosition`                                   | Player assisted a kill.                 |
| `suicide`            | `player`, `weapon`, `attackerPosition`                                                                         | Player killed themselves.               |
| `medicDeath`         | `player`, `victim`, `healing`, `ubercharge`                                                                    | Medic was killed.                       |
| `medicDeathEx`       | `player`, `uberpct`                                                                                            | Extended medic death info.              |
| `playerExtinguished` | `player`, `victim`, `weapon`, `attackerPosition`, `victimPosition`                                             | Player extinguished a burning teammate. |
| `shotFired`          | `player`, `weapon`                                                                                             | Player fired a weapon.                  |
| `shotHit`            | `player`, `weapon`                                                                                             | Player's shot hit a target.             |

#### Healing & Ubercharge

| Type                  | Attributes                                           | Description                             |
| --------------------- | ---------------------------------------------------- | --------------------------------------- |
| `healed`              | `player`, `target`, `healing`, `airshot?`, `height?` | Medic healed a target.                  |
| `chargeReady`         | `player`                                             | Medigun charge is ready.                |
| `chargeDeployed`      | `player`, `medigun`                                  | Ubercharge deployed.                    |
| `chargeEnded`         | `player`, `duration`                                 | Ubercharge ended.                       |
| `emptyUber`           | `player`                                             | Ubercharge fully depleted.              |
| `firstHealAfterSpawn` | `player`, `time`                                     | Time of first heal after medic spawned. |
| `lostUberAdvantage`   | `player`, `time`                                     | Medic lost uber advantage.              |

#### Objectives

| Type             | Attributes                                        | Description                    |
| ---------------- | ------------------------------------------------- | ------------------------------ |
| `pointCaptured`  | `team`, `cp`, `cpname`, `numcappers`, `players[]` | Team captured a control point. |
| `captureBlocked` | `player`, `cp`, `cpname`, `position`              | Player blocked a capture.      |

#### Buildings & Objects

| Type                | Attributes                                                                                      | Description                        |
| ------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| `playerBuiltObject` | `player`, `object`, `position`                                                                  | Player built an object.            |
| `killedObject`      | `player`, `object`, `weapon`, `objectowner`, `attackerPosition`, `assist?`, `assisterPosition?` | Player destroyed an object.        |
| `objectDetonated`   | `player`, `object`, `position`                                                                  | Player detonated their own object. |
| `playerCarryObject` | `player`, `object`, `position`                                                                  | Player picked up their building.   |
| `playerDropObject`  | `player`, `object`, `position`                                                                  | Player dropped their building.     |

#### Round & Game

| Type                   | Attributes                    | Description                        |
| ---------------------- | ----------------------------- | ---------------------------------- |
| `roundStart`           | —                             | Round started.                     |
| `roundSetupBegin`      | —                             | Setup phase began.                 |
| `roundSetupEnd`        | —                             | Setup phase ended.                 |
| `roundWin`             | `winner`                      | Round won by a team.               |
| `roundLength`          | `seconds`                     | Round duration in seconds.         |
| `roundOvertime`        | —                             | Overtime started.                  |
| `roundStalemate`       | —                             | Round ended in a stalemate.        |
| `gameOver`             | `reason`                      | Game ended.                        |
| `currentScore`         | `team`, `score`, `numPlayers` | Mid-game score report.             |
| `finalScore`           | `team`, `score`, `numPlayers` | End-of-game score report.          |
| `intermissionWinLimit` | `team`                        | Intermission or win limit reached. |

#### Player State

| Type                   | Attributes                   | Description                           |
| ---------------------- | ---------------------------- | ------------------------------------- |
| `spawned`              | `player`, `role`             | Player spawned as a class.            |
| `spawnedMFilter`       | `player`, `role?`            | Player spawned with m_filter.         |
| `changedRole`          | `player`, `role`             | Player changed class.                 |
| `changedName`          | `player`, `newName`          | Player changed their name.            |
| `chargedMFilter`       | `player`, `role`             | Player charged as role with m_filter. |
| `pickedUpItem`         | `player`, `item`, `healing?` | Player picked up an item.             |
| `joinedTeam`           | `player`, `newTeam`          | Player joined a team.                 |
| `connected`            | `player`, `address`          | Player connected to the server.       |
| `disconnected`         | `player`, `reason`           | Player disconnected.                  |
| `steamUserIdValidated` | `player`                     | Player's Steam ID was validated.      |
| `enteredGame`          | `player`                     | Player entered the game.              |
| `positionReport`       | `player`, `position`         | Player position report.               |

#### Domination & Revenge

| Type         | Attributes                    | Description                   |
| ------------ | ----------------------------- | ----------------------------- |
| `domination` | `player`, `victim`, `assist?` | Player is dominating another. |
| `revenge`    | `player`, `victim`, `assist?` | Player got revenge.           |

#### Chat

| Type      | Attributes          | Description          |
| --------- | ------------------- | -------------------- |
| `say`     | `player`, `message` | Public chat message. |
| `sayTeam` | `player`, `message` | Team chat message.   |

#### Pause

| Type           | Attributes | Description                  |
| -------------- | ---------- | ---------------------------- |
| `matchPause`   | `player`   | Player triggered a pause.    |
| `matchUnpause` | `player`   | Player triggered an unpause. |
| `gamePaused`   | —          | Game is paused.              |
| `gameUnpaused` | —          | Game is unpaused.            |
| `pauseLength`  | `seconds`  | Pause duration in seconds.   |

#### Passtime

| Type                  | Attributes                                                                                                      | Description                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `passGet`             | `player`, `firstcontact`, `position`                                                                            | Player got the ball.        |
| `passFree`            | `player`, `position`                                                                                            | Ball became free.           |
| `passPassCaught`      | `player`, `target`, `interception`, `save`, `handoff`, `dist`, `duration`, `throwerPosition`, `catcherPosition` | Pass was caught.            |
| `passScore`           | `player`, `points`, `panacea`, `winStrat`, `deathbomb`, `dist`, `position`                                      | Player scored.              |
| `passScoreAssist`     | `player`, `position`                                                                                            | Player assisted a score.    |
| `passBallStolen`      | `player`, `victim`, `stealDefense`, `thiefPosition`, `victimPosition`                                           | Ball was stolen.            |
| `catapult`            | `player`, `catapult`, `position`                                                                                | Player used a catapult.     |
| `passtimeBallSpawned` | `location`                                                                                                      | Ball spawned at a location. |
| `passtimeBallDamage`  | `details`                                                                                                       | Ball took damage.           |
| `panaceaCheck`        | `details`                                                                                                       | Panacea check event.        |

#### System

| Type                  | Attributes          | Description                                                           |
| --------------------- | ------------------- | --------------------------------------------------------------------- |
| `serverPluginMessage` | `plugin`, `message` | Message from a server plugin (e.g. demos.tf, SteamNetworkingSockets). |
| `worldMetaData`       | `key`, `value`      | Match metadata (matchid, map, title).                                 |
| `meta`                | `label`, `kvs`      | Meta comment line (e.g. `# COMBINED_LOG`).                            |
| `printingForClient`   | `client`            | Server printing for a client.                                         |
| `unknown`             | `body`              | Unrecognized log line (fallback).                                     |

## Benchmarks

Measured on real match logs (median of 20 runs after 3 warmup runs):

| Fixture      |    Size | Lines |     Time | Lines/sec |
| ------------ | ------: | ----: | -------: | --------: |
| cp.log       | 1601 KB | 12692 | 159.6 ms |    79,542 |
| koth.log     | 1147 KB |  8519 |  88.7 ms |    96,013 |
| passtime.log | 1246 KB | 10260 | 179.4 ms |    57,191 |
| payload.log  | 1463 KB | 11066 | 129.8 ms |    85,237 |
| ultiduo.log  |  285 KB |  2172 |  25.1 ms |    86,621 |

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
