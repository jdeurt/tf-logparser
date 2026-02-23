# Contributing

This guide covers the most common contribution: adding or fixing event parsers.

## How the parser works

The parser is a [Peggy](https://peggyjs.org/) PEG grammar (`src/tf2.peggy`) that gets compiled to JavaScript. Each TF2 log line is parsed independently — the grammar matches a timestamp prefix, then tries each event rule in order until one succeeds. If nothing matches, it falls back to `unknown`.

The key files:

| File                                 | Purpose                                                             |
| ------------------------------------ | ------------------------------------------------------------------- |
| `src/parser/tf2.peggy`               | Peggy grammar — all event parsing rules live here                   |
| `src/parser/types.ts`                | TypeScript interfaces for every event type                          |
| `src/__tests__/parser/schema.ts`     | AJV JSON Schema used for validation                                 |
| `src/parser/parser.ts`               | Thin wrapper that splits input lines and calls the generated parser |
| `src/parser/generated/tf2-parser.js` | Auto-generated from the grammar (do not edit)                       |

## Adding a new event parser

### 1. Get an example log line

Find a real log line for the event you want to parse. Every TF2 log line looks like:

```
L MM/DD/YYYY - HH:MM:SS: <event data>
```

For example, if you wanted to parse a `domination` event, the line looks like:

```
L 02/23/2026 - 06:12:01: "Frank<52><[U:1:156276611]><Red>" triggered "domination" against "tributary<53><[U:1:36036078]><Blue>"
```

### 2. Add a grammar rule in `src/parser/tf2.peggy`

Event rules follow common patterns. Here are the most frequent:

**Player triggered an event (no extra data):**

```peggy
EmptyUberEvent
  = player:Player
    " triggered \"empty_uber\""
    { return { type: "emptyUber", player }; }
```

**Player triggered an event with key-value pairs:**

```peggy
ShotFiredEvent
  = player:Player
    " triggered \"shot_fired\""
    kvs:KVs
    { return { type: "shotFired", player, weapon: kvs.weapon }; }
```

**Player-vs-player event with KVs and optional fields:**

```peggy
DamageEvent
  = player:Player
  " triggered \"damage\" against "
  victim:Player
  kvs:KVs
    {
      const result = {
        type: "damage",
        player,
        victim,
        damage: int(kvs.damage),
        weapon: kvs.weapon
      };
      if (kvs.realdamage !== undefined) result.realdamage = int(kvs.realdamage);
      if (kvs.crit !== undefined) result.crit = kvs.crit;
      if (kvs.headshot !== undefined) result.headshot = true;
      return result;
    }
```

Key-value pairs in TF2 logs look like `(key "value")` and are parsed by the `KVs` rule into an object. Use the `int()` and `float()` helpers to convert string values to numbers.

**Important:** Add your new rule to the `Event` ordered-choice list (the `/`-separated list near the top of the grammar). Order matters — more specific rules should come before more general ones that could match the same prefix. The `UnknownEvent` rule must stay last.

### 3. Add a TypeScript interface in `src/parser/types.ts`

```ts
export interface MyNewEvent extends RawBaseEvent {
  type: "myNew";
  player: Player;
  // ... other fields
}
```

Then add it to the `TfLogEvent` discriminated union at the bottom of the file.

### 4. Add a schema entry in `src/__tests__/parser/schema.ts`

Add a JSON Schema definition for your event to the `oneOf` array. Follow the existing patterns.

### 5. Build and test

```bash
npm test
```

This rebuilds the parser from the grammar and runs all tests. The tests parse every fixture file and assert **zero unknown events** — if an existing line stops parsing, the test will fail and print the unparsed lines.

## Fixing a broken parser (handling new log lines)

When you encounter a log line the parser doesn't handle:

### 1. Create a fixture file

Save a log file that contains the problematic line(s) to `fixtures/`. You can put it directly in `fixtures/` or in `fixtures/misc/`. The test suite auto-discovers all `.log` files recursively.

The file must be a valid TF2 log — every non-empty line should start with `L MM/DD/YYYY - HH:MM:SS:`. It doesn't need to be a full match log; a handful of lines is enough, but it must include the line that broke the parser.

**Example:** The file `fixtures/misc/example-broken-line.log` was added as a reference. It contains a mix of common event types including lines like `Printing for client: 11` that originally failed to parse before the `PrintingForClientEvent` rule was added to the grammar.

### 2. Run the tests to confirm the failure

```bash
npm test
```

The "has zero unknown events" test will fail for your new fixture and print the unrecognized lines.

### 3. Fix the grammar

Update `src/tf2.peggy` to handle the new line format. You may need to:

- Add a new rule (see "Adding a new event parser" above)
- Modify an existing rule to be more flexible (e.g., making a field optional)

### 4. Update types and schema if needed

If your fix adds new fields or a new event type, update `src/parser/types.ts` and `src/__tests__/parser/schema.ts`.

### 5. Run the tests again

```bash
npm test
```

All fixture files must pass with zero unknown events.

## Testing tips

- The test suite auto-discovers all `.log` files under `fixtures/` recursively — just drop a file there and it gets tested.
- On failure, the test prints up to 20 unique unparsed lines so you can see what patterns are missing.
- Use `npm run test:watch` during development for fast feedback.
- Use `npm run stringify-log -- <path>` to see the parsed output for a specific log file.

## Build commands

```bash
npm run build:parser   # Regenerate parser from grammar
npm run build          # Full build (parser + TypeScript)
npm test               # Build parser + run tests
npm run test:watch     # Watch mode
npm run lint           # Lint
npm run format         # Format with Prettier
```
