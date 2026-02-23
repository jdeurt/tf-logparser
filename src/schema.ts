import Ajv, { type JSONSchemaType } from "ajv";
import type {
  BaseEvent,
  CaptureBlockedEvent,
  CatapultEvent,
  ChangedNameEvent,
  ChangedRoleEvent,
  ChargeDeployedEvent,
  ChargeEndedEvent,
  ChargeReadyEvent,
  ChargedMFilterEvent,
  ConnectedEvent,
  CurrentScoreEvent,
  DamageEvent,
  DemosTfEvent,
  DominationEvent,
  EmptyUberEvent,
  EnteredGameEvent,
  FinalScoreEvent,
  FirstHealAfterSpawnEvent,
  GameOverEvent,
  GamePausedEvent,
  GameUnpausedEvent,
  HealedEvent,
  IntermissionWinLimitEvent,
  JoinedTeamEvent,
  KillAssistEvent,
  KillEvent,
  KilledObjectEvent,
  LostUberAdvantageEvent,
  MatchPauseEvent,
  MatchUnpauseEvent,
  MedicDeathEvent,
  MedicDeathExEvent,
  ObjectDetonatedEvent,
  PanaceaCheckEvent,
  PassBallStolenEvent,
  PassFreeEvent,
  PassGetEvent,
  PassPassCaughtEvent,
  PassScoreAssistEvent,
  PassScoreEvent,
  PasstimeBallDamageEvent,
  PasstimeBallSpawnedEvent,
  PauseLengthEvent,
  PickedUpItemEvent,
  Player,
  PlayerBuiltObjectEvent,
  PlayerCarryObjectEvent,
  PlayerDropObjectEvent,
  PlayerExtinguishedEvent,
  PointCapturedEvent,
  PositionReportEvent,
  PrintingForClientEvent,
  RevengeEvent,
  RoundLengthEvent,
  RoundOvertimeEvent,
  RoundSetupBeginEvent,
  RoundSetupEndEvent,
  RoundStartEvent,
  RoundWinEvent,
  SayEvent,
  SayTeamEvent,
  ShotFiredEvent,
  ShotHitEvent,
  SpawnedEvent,
  SpawnedMFilterEvent,
  SuicideEvent,
  TfLogEvent,
  UnknownEvent,
} from "./types.js";

const ajv = new Ajv.default({ discriminator: true });

// ─── Shared definitions ──────────────────────────────────

const playerSchema: JSONSchemaType<Player> = {
  type: "object",
  properties: {
    name: { type: "string" },
    entityId: { type: "integer" },
    steamId: { type: "string" },
    team: { type: "string" },
  },
  required: ["name", "entityId", "steamId", "team"],
  additionalProperties: false,
};

const T = "string" as const;
const N = "number" as const;
const I = "integer" as const;
const B = "boolean" as const;

type EventKey<E extends BaseEvent> = Exclude<
  keyof E & string,
  keyof BaseEvent | "type"
>;

/** Build a single event sub-schema with base fields baked in. */
function eventSchema<E extends BaseEvent & { type: string }>(
  typeConst: E["type"],
  props: { [K in EventKey<E>]: unknown },
  required: EventKey<E>[],
) {
  return {
    type: "object" as const,
    properties: {
      timestamp: { type: N },
      raw: { type: T },
      type: { type: T, const: typeConst },
      ...props,
    },
    required: ["timestamp", "raw", "type", ...required],
    additionalProperties: false as const,
  };
}

// ─── Player-triggered events ─────────────────────────────

const changedRoleSchema = eventSchema<ChangedRoleEvent>(
  "changedRole",
  {
    player: playerSchema,
    role: { type: T },
  },
  ["player", "role"],
);

const damageSchema = eventSchema<DamageEvent>(
  "damage",
  {
    player: playerSchema,
    victim: playerSchema,
    damage: { type: I },
    realdamage: { type: I, nullable: true },
    weapon: { type: T },
    crit: { type: T, enum: ["crit", "mini"], nullable: true },
    headshot: { type: B, nullable: true },
    airshot: { type: B, nullable: true },
    height: { type: I, nullable: true },
    healing: { type: I, nullable: true },
  },
  ["player", "victim", "damage", "weapon"],
);

const shotFiredSchema = eventSchema<ShotFiredEvent>(
  "shotFired",
  {
    player: playerSchema,
    weapon: { type: T },
  },
  ["player", "weapon"],
);

const shotHitSchema = eventSchema<ShotHitEvent>(
  "shotHit",
  {
    player: playerSchema,
    weapon: { type: T },
  },
  ["player", "weapon"],
);

const pickedUpItemSchema = eventSchema<PickedUpItemEvent>(
  "pickedUpItem",
  {
    player: playerSchema,
    item: { type: T },
    healing: { type: I, nullable: true },
  },
  ["player", "item"],
);

const killSchema = eventSchema<KillEvent>(
  "kill",
  {
    player: playerSchema,
    victim: playerSchema,
    weapon: { type: T },
    customkill: { type: T, nullable: true },
    attackerPosition: { type: T },
    victimPosition: { type: T },
  },
  ["player", "victim", "weapon", "attackerPosition", "victimPosition"],
);

const medicDeathSchema = eventSchema<MedicDeathEvent>(
  "medicDeath",
  {
    player: playerSchema,
    victim: playerSchema,
    healing: { type: I },
    ubercharge: { type: I },
  },
  ["player", "victim", "healing", "ubercharge"],
);

const medicDeathExSchema = eventSchema<MedicDeathExEvent>(
  "medicDeathEx",
  {
    player: playerSchema,
    uberpct: { type: I },
  },
  ["player", "uberpct"],
);

const spawnedSchema = eventSchema<SpawnedEvent>(
  "spawned",
  {
    player: playerSchema,
    role: { type: T },
  },
  ["player", "role"],
);

const healedSchema = eventSchema<HealedEvent>(
  "healed",
  {
    player: playerSchema,
    target: playerSchema,
    healing: { type: I },
    airshot: { type: B, nullable: true },
    height: { type: I, nullable: true },
  },
  ["player", "target", "healing"],
);

const emptyUberSchema = eventSchema<EmptyUberEvent>(
  "emptyUber",
  {
    player: playerSchema,
  },
  ["player"],
);

const chargeReadySchema = eventSchema<ChargeReadyEvent>(
  "chargeReady",
  {
    player: playerSchema,
  },
  ["player"],
);

const chargeDeployedSchema = eventSchema<ChargeDeployedEvent>(
  "chargeDeployed",
  {
    player: playerSchema,
    medigun: { type: T },
  },
  ["player", "medigun"],
);

const chargeEndedSchema = eventSchema<ChargeEndedEvent>(
  "chargeEnded",
  {
    player: playerSchema,
    duration: { type: N },
  },
  ["player", "duration"],
);

const firstHealAfterSpawnSchema = eventSchema<FirstHealAfterSpawnEvent>(
  "firstHealAfterSpawn",
  {
    player: playerSchema,
    time: { type: N },
  },
  ["player", "time"],
);

const killAssistSchema = eventSchema<KillAssistEvent>(
  "killAssist",
  {
    player: playerSchema,
    victim: playerSchema,
    assisterPosition: { type: T },
    attackerPosition: { type: T },
    victimPosition: { type: T },
  },
  [
    "player",
    "victim",
    "assisterPosition",
    "attackerPosition",
    "victimPosition",
  ],
);

const dominationSchema = eventSchema<DominationEvent>(
  "domination",
  {
    player: playerSchema,
    victim: playerSchema,
    assist: { type: B, nullable: true },
  },
  ["player", "victim"],
);

const revengeSchema = eventSchema<RevengeEvent>(
  "revenge",
  {
    player: playerSchema,
    victim: playerSchema,
    assist: { type: B, nullable: true },
  },
  ["player", "victim"],
);

const captureBlockedSchema = eventSchema<CaptureBlockedEvent>(
  "captureBlocked",
  {
    player: playerSchema,
    cp: { type: I },
    cpname: { type: T },
    position: { type: T },
  },
  ["player", "cp", "cpname", "position"],
);

const killedObjectSchema = eventSchema<KilledObjectEvent>(
  "killedObject",
  {
    player: playerSchema,
    object: { type: T },
    weapon: { type: T },
    objectowner: { type: T },
    attackerPosition: { type: T },
    assist: { type: B, nullable: true },
    assisterPosition: { type: T, nullable: true },
  },
  ["player", "object", "weapon", "objectowner", "attackerPosition"],
);

const playerBuiltObjectSchema = eventSchema<PlayerBuiltObjectEvent>(
  "playerBuiltObject",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const objectDetonatedSchema = eventSchema<ObjectDetonatedEvent>(
  "objectDetonated",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const playerCarryObjectSchema = eventSchema<PlayerCarryObjectEvent>(
  "playerCarryObject",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const playerDropObjectSchema = eventSchema<PlayerDropObjectEvent>(
  "playerDropObject",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const playerExtinguishedSchema = eventSchema<PlayerExtinguishedEvent>(
  "playerExtinguished",
  {
    player: playerSchema,
    victim: playerSchema,
    weapon: { type: T },
    attackerPosition: { type: T },
    victimPosition: { type: T },
  },
  ["player", "victim", "weapon", "attackerPosition", "victimPosition"],
);

const lostUberAdvantageSchema = eventSchema<LostUberAdvantageEvent>(
  "lostUberAdvantage",
  {
    player: playerSchema,
    time: { type: I },
  },
  ["player", "time"],
);

// ─── Chat events ─────────────────────────────────────────

const saySchema = eventSchema<SayEvent>(
  "say",
  {
    player: playerSchema,
    message: { type: T },
  },
  ["player", "message"],
);

const sayTeamSchema = eventSchema<SayTeamEvent>(
  "sayTeam",
  {
    player: playerSchema,
    message: { type: T },
  },
  ["player", "message"],
);

// ─── Non-triggered player events ─────────────────────────

const suicideSchema = eventSchema<SuicideEvent>(
  "suicide",
  {
    player: playerSchema,
    weapon: { type: T },
    attackerPosition: { type: T },
  },
  ["player", "weapon", "attackerPosition"],
);

const positionReportSchema = eventSchema<PositionReportEvent>(
  "positionReport",
  {
    player: playerSchema,
    position: { type: T },
  },
  ["player", "position"],
);

const joinedTeamSchema = eventSchema<JoinedTeamEvent>(
  "joinedTeam",
  {
    player: playerSchema,
    newTeam: { type: T },
  },
  ["player", "newTeam"],
);

const connectedSchema = eventSchema<ConnectedEvent>(
  "connected",
  {
    player: playerSchema,
    address: { type: T },
  },
  ["player", "address"],
);

const enteredGameSchema = eventSchema<EnteredGameEvent>(
  "enteredGame",
  {
    player: playerSchema,
  },
  ["player"],
);

const changedNameSchema = eventSchema<ChangedNameEvent>(
  "changedName",
  {
    player: playerSchema,
    newName: { type: T },
  },
  ["player", "newName"],
);

// ─── World / round events ────────────────────────────────

const roundStartSchema = eventSchema<RoundStartEvent>("roundStart", {}, []);
const roundSetupBeginSchema = eventSchema<RoundSetupBeginEvent>(
  "roundSetupBegin",
  {},
  [],
);
const roundSetupEndSchema = eventSchema<RoundSetupEndEvent>(
  "roundSetupEnd",
  {},
  [],
);
const roundOvertimeSchema = eventSchema<RoundOvertimeEvent>(
  "roundOvertime",
  {},
  [],
);

const roundWinSchema = eventSchema<RoundWinEvent>(
  "roundWin",
  {
    winner: { type: T },
  },
  ["winner"],
);

const roundLengthSchema = eventSchema<RoundLengthEvent>(
  "roundLength",
  {
    seconds: { type: N },
  },
  ["seconds"],
);

const gameOverSchema = eventSchema<GameOverEvent>(
  "gameOver",
  {
    reason: { type: T },
  },
  ["reason"],
);

// ─── Team events ─────────────────────────────────────────

const pointCapturedSchema = eventSchema<PointCapturedEvent>(
  "pointCaptured",
  {
    team: { type: T },
    cp: { type: I },
    cpname: { type: T },
    numcappers: { type: I },
    players: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          player: { type: T },
          position: { type: T },
        },
        required: ["player", "position"],
        additionalProperties: false,
      },
    },
  },
  ["team", "cp", "cpname", "numcappers", "players"],
);

const currentScoreSchema = eventSchema<CurrentScoreEvent>(
  "currentScore",
  {
    team: { type: T },
    score: { type: I },
    numPlayers: { type: I },
  },
  ["team", "score", "numPlayers"],
);

const finalScoreSchema = eventSchema<FinalScoreEvent>(
  "finalScore",
  {
    team: { type: T },
    score: { type: I },
    numPlayers: { type: I },
  },
  ["team", "score", "numPlayers"],
);

const intermissionWinLimitSchema = eventSchema<IntermissionWinLimitEvent>(
  "intermissionWinLimit",
  {
    team: { type: T },
  },
  ["team"],
);

// ─── Pause events ────────────────────────────────────────

const matchPauseSchema = eventSchema<MatchPauseEvent>(
  "matchPause",
  {
    player: playerSchema,
  },
  ["player"],
);

const matchUnpauseSchema = eventSchema<MatchUnpauseEvent>(
  "matchUnpause",
  {
    player: playerSchema,
  },
  ["player"],
);

const gamePausedSchema = eventSchema<GamePausedEvent>("gamePaused", {}, []);
const gameUnpausedSchema = eventSchema<GameUnpausedEvent>(
  "gameUnpaused",
  {},
  [],
);

const pauseLengthSchema = eventSchema<PauseLengthEvent>(
  "pauseLength",
  {
    seconds: { type: N },
  },
  ["seconds"],
);

// ─── Passtime events ─────────────────────────────────────

const passGetSchema = eventSchema<PassGetEvent>(
  "passGet",
  {
    player: playerSchema,
    firstcontact: { type: B },
    position: { type: T },
  },
  ["player", "firstcontact", "position"],
);

const passFreeSchema = eventSchema<PassFreeEvent>(
  "passFree",
  {
    player: playerSchema,
    position: { type: T },
  },
  ["player", "position"],
);

const passPassCaughtSchema = eventSchema<PassPassCaughtEvent>(
  "passPassCaught",
  {
    player: playerSchema,
    target: playerSchema,
    interception: { type: B },
    save: { type: B },
    handoff: { type: B },
    dist: { type: N },
    duration: { type: N },
    throwerPosition: { type: T },
    catcherPosition: { type: T },
  },
  [
    "player",
    "target",
    "interception",
    "save",
    "handoff",
    "dist",
    "duration",
    "throwerPosition",
    "catcherPosition",
  ],
);

const passScoreSchema = eventSchema<PassScoreEvent>(
  "passScore",
  {
    player: playerSchema,
    points: { type: I },
    panacea: { type: B },
    winStrat: { type: B },
    deathbomb: { type: B },
    dist: { type: N },
    position: { type: T },
  },
  ["player", "points", "panacea", "winStrat", "deathbomb", "dist", "position"],
);

const passScoreAssistSchema = eventSchema<PassScoreAssistEvent>(
  "passScoreAssist",
  {
    player: playerSchema,
    position: { type: T },
  },
  ["player", "position"],
);

const passBallStolenSchema = eventSchema<PassBallStolenEvent>(
  "passBallStolen",
  {
    player: playerSchema,
    victim: playerSchema,
    stealDefense: { type: B },
    thiefPosition: { type: T },
    victimPosition: { type: T },
  },
  ["player", "victim", "stealDefense", "thiefPosition", "victimPosition"],
);

const catapultSchema = eventSchema<CatapultEvent>(
  "catapult",
  {
    player: playerSchema,
    catapult: { type: T },
    position: { type: T },
  },
  ["player", "catapult", "position"],
);

const passtimeBallSpawnedSchema = eventSchema<PasstimeBallSpawnedEvent>(
  "passtimeBallSpawned",
  {
    location: { type: T },
  },
  ["location"],
);

const passtimeBallDamageSchema = eventSchema<PasstimeBallDamageEvent>(
  "passtimeBallDamage",
  {
    details: { type: T },
  },
  ["details"],
);

const panaceaCheckSchema = eventSchema<PanaceaCheckEvent>(
  "panaceaCheck",
  {
    details: { type: T },
  },
  ["details"],
);

// ─── System / plugin events ──────────────────────────────

const demosTfSchema = eventSchema<DemosTfEvent>(
  "demosTf",
  {
    message: { type: T },
  },
  ["message"],
);

const printingForClientSchema = eventSchema<PrintingForClientEvent>(
  "printingForClient",
  {
    client: { type: I },
  },
  ["client"],
);

// ─── Spawn / name variants ───────────────────────────────

const spawnedMFilterSchema = eventSchema<SpawnedMFilterEvent>(
  "spawnedMFilter",
  {
    player: playerSchema,
    role: { type: T, nullable: true },
  },
  ["player"],
);

const chargedMFilterSchema = eventSchema<ChargedMFilterEvent>(
  "chargedMFilter",
  {
    player: playerSchema,
    role: { type: T },
  },
  ["player", "role"],
);

// ─── Fallback ────────────────────────────────────────────

const unknownSchema = eventSchema<UnknownEvent>(
  "unknown",
  {
    body: { type: T },
  },
  ["body"],
);

// ─── Combined schema ─────────────────────────────────────

const tfLogEventSchema = {
  type: "object" as const,
  discriminator: { propertyName: "type" },
  oneOf: [
    changedRoleSchema,
    damageSchema,
    shotFiredSchema,
    shotHitSchema,
    pickedUpItemSchema,
    killSchema,
    medicDeathSchema,
    medicDeathExSchema,
    spawnedSchema,
    roundStartSchema,
    roundSetupBeginSchema,
    roundSetupEndSchema,
    roundWinSchema,
    roundLengthSchema,
    roundOvertimeSchema,
    gameOverSchema,
    emptyUberSchema,
    healedSchema,
    saySchema,
    sayTeamSchema,
    killAssistSchema,
    playerBuiltObjectSchema,
    pointCapturedSchema,
    currentScoreSchema,
    finalScoreSchema,
    suicideSchema,
    positionReportSchema,
    demosTfSchema,
    chargeReadySchema,
    chargeDeployedSchema,
    chargeEndedSchema,
    firstHealAfterSpawnSchema,
    dominationSchema,
    revengeSchema,
    captureBlockedSchema,
    killedObjectSchema,
    objectDetonatedSchema,
    playerCarryObjectSchema,
    playerDropObjectSchema,
    playerExtinguishedSchema,
    lostUberAdvantageSchema,
    joinedTeamSchema,
    connectedSchema,
    enteredGameSchema,
    matchPauseSchema,
    matchUnpauseSchema,
    gamePausedSchema,
    gameUnpausedSchema,
    pauseLengthSchema,
    passGetSchema,
    passFreeSchema,
    passPassCaughtSchema,
    passScoreSchema,
    passScoreAssistSchema,
    passBallStolenSchema,
    catapultSchema,
    passtimeBallSpawnedSchema,
    passtimeBallDamageSchema,
    panaceaCheckSchema,
    printingForClientSchema,
    spawnedMFilterSchema,
    chargedMFilterSchema,
    changedNameSchema,
    intermissionWinLimitSchema,
    unknownSchema,
  ],
};

export const validateTfLogEvent = ajv.compile<TfLogEvent>(tfLogEventSchema);
