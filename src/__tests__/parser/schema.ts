import Ajv, { type JSONSchemaType } from "ajv";
import type {
  RawBaseEvent,
  RawCaptureBlockedEvent,
  RawMetaEvent,
  RawCatapultEvent,
  RawChangedNameEvent,
  RawChangedRoleEvent,
  RawChargeDeployedEvent,
  RawChargeEndedEvent,
  RawChargeReadyEvent,
  RawChargedMFilterEvent,
  RawConnectedEvent,
  RawCurrentScoreEvent,
  RawDamageEvent,
  RawDisconnectedEvent,
  RawDominationEvent,
  RawEmptyUberEvent,
  RawEnteredGameEvent,
  RawFinalScoreEvent,
  RawFirstHealAfterSpawnEvent,
  RawGameOverEvent,
  RawGamePausedEvent,
  RawGameUnpausedEvent,
  RawHealedEvent,
  RawIntermissionWinLimitEvent,
  RawJoinedTeamEvent,
  RawKillAssistEvent,
  RawKillEvent,
  RawKilledObjectEvent,
  RawLostUberAdvantageEvent,
  RawMatchPauseEvent,
  RawMatchUnpauseEvent,
  RawMedicDeathEvent,
  RawMedicDeathExEvent,
  RawObjectDetonatedEvent,
  RawPanaceaCheckEvent,
  RawPassBallStolenEvent,
  RawPassFreeEvent,
  RawPassGetEvent,
  RawPassPassCaughtEvent,
  RawPassScoreAssistEvent,
  RawPassScoreEvent,
  RawPasstimeBallDamageEvent,
  RawPasstimeBallSpawnedEvent,
  RawPauseLengthEvent,
  RawPickedUpItemEvent,
  Player,
  RawPlayerBuiltObjectEvent,
  RawPlayerCarryObjectEvent,
  RawPlayerDropObjectEvent,
  RawPlayerExtinguishedEvent,
  RawPointCapturedEvent,
  RawPositionReportEvent,
  RawPrintingForClientEvent,
  RawRevengeEvent,
  RawRoundLengthEvent,
  RawRoundOvertimeEvent,
  RawRoundStalemateEvent,
  RawRoundSetupBeginEvent,
  RawRoundSetupEndEvent,
  RawRoundStartEvent,
  RawRoundWinEvent,
  RawSayEvent,
  RawSayTeamEvent,
  RawServerPluginMessageEvent,
  RawShotFiredEvent,
  RawShotHitEvent,
  RawSpawnedEvent,
  RawSpawnedMFilterEvent,
  RawSteamUserIdValidatedEvent,
  RawSuicideEvent,
  RawTfLogEvent,
  RawUnknownEvent,
  RawWorldMetaDataEvent,
} from "../../types/index.js";

const ajv = new Ajv({ discriminator: true });

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

type EventKey<E extends RawBaseEvent> = Exclude<
  keyof E & string,
  keyof RawBaseEvent | "type"
>;

/** Build a single event sub-schema with base fields baked in. */
function eventSchema<E extends RawBaseEvent & { type: string }>(
  typeConst: E["type"],
  props: { [K in EventKey<E>]: unknown },
  required: EventKey<E>[],
) {
  return {
    type: "object" as const,
    properties: {
      timestamp: { type: N },
      lineNumber: { type: I },
      type: { type: T, const: typeConst },
      ...props,
    },
    required: ["timestamp", "lineNumber", "type", ...required],
    additionalProperties: false as const,
  };
}

// ─── Player-triggered events ─────────────────────────────

const changedRoleSchema = eventSchema<RawChangedRoleEvent>(
  "changedRole",
  {
    player: playerSchema,
    role: { type: T },
  },
  ["player", "role"],
);

const damageSchema = eventSchema<RawDamageEvent>(
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

const shotFiredSchema = eventSchema<RawShotFiredEvent>(
  "shotFired",
  {
    player: playerSchema,
    weapon: { type: T },
  },
  ["player", "weapon"],
);

const shotHitSchema = eventSchema<RawShotHitEvent>(
  "shotHit",
  {
    player: playerSchema,
    weapon: { type: T },
  },
  ["player", "weapon"],
);

const pickedUpItemSchema = eventSchema<RawPickedUpItemEvent>(
  "pickedUpItem",
  {
    player: playerSchema,
    item: { type: T },
    healing: { type: I, nullable: true },
  },
  ["player", "item"],
);

const killSchema = eventSchema<RawKillEvent>(
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

const medicDeathSchema = eventSchema<RawMedicDeathEvent>(
  "medicDeath",
  {
    player: playerSchema,
    victim: playerSchema,
    healing: { type: I },
    ubercharge: { type: I },
  },
  ["player", "victim", "healing", "ubercharge"],
);

const medicDeathExSchema = eventSchema<RawMedicDeathExEvent>(
  "medicDeathEx",
  {
    player: playerSchema,
    uberpct: { type: I },
  },
  ["player", "uberpct"],
);

const spawnedSchema = eventSchema<RawSpawnedEvent>(
  "spawned",
  {
    player: playerSchema,
    role: { type: T },
  },
  ["player", "role"],
);

const healedSchema = eventSchema<RawHealedEvent>(
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

const emptyUberSchema = eventSchema<RawEmptyUberEvent>(
  "emptyUber",
  {
    player: playerSchema,
  },
  ["player"],
);

const chargeReadySchema = eventSchema<RawChargeReadyEvent>(
  "chargeReady",
  {
    player: playerSchema,
  },
  ["player"],
);

const chargeDeployedSchema = eventSchema<RawChargeDeployedEvent>(
  "chargeDeployed",
  {
    player: playerSchema,
    medigun: { type: T },
  },
  ["player", "medigun"],
);

const chargeEndedSchema = eventSchema<RawChargeEndedEvent>(
  "chargeEnded",
  {
    player: playerSchema,
    duration: { type: N },
  },
  ["player", "duration"],
);

const firstHealAfterSpawnSchema = eventSchema<RawFirstHealAfterSpawnEvent>(
  "firstHealAfterSpawn",
  {
    player: playerSchema,
    time: { type: N },
  },
  ["player", "time"],
);

const killAssistSchema = eventSchema<RawKillAssistEvent>(
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

const dominationSchema = eventSchema<RawDominationEvent>(
  "domination",
  {
    player: playerSchema,
    victim: playerSchema,
    assist: { type: B, nullable: true },
  },
  ["player", "victim"],
);

const revengeSchema = eventSchema<RawRevengeEvent>(
  "revenge",
  {
    player: playerSchema,
    victim: playerSchema,
    assist: { type: B, nullable: true },
  },
  ["player", "victim"],
);

const captureBlockedSchema = eventSchema<RawCaptureBlockedEvent>(
  "captureBlocked",
  {
    player: playerSchema,
    cp: { type: I },
    cpname: { type: T },
    position: { type: T },
  },
  ["player", "cp", "cpname", "position"],
);

const killedObjectSchema = eventSchema<RawKilledObjectEvent>(
  "killedObject",
  {
    player: playerSchema,
    object: { type: T },
    weapon: { type: T, nullable: true },
    objectowner: { type: T },
    attackerPosition: { type: T },
    assist: { type: B, nullable: true },
    assisterPosition: { type: T, nullable: true },
  },
  ["player", "object", "objectowner", "attackerPosition"],
);

const playerBuiltObjectSchema = eventSchema<RawPlayerBuiltObjectEvent>(
  "playerBuiltObject",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const objectDetonatedSchema = eventSchema<RawObjectDetonatedEvent>(
  "objectDetonated",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const playerCarryObjectSchema = eventSchema<RawPlayerCarryObjectEvent>(
  "playerCarryObject",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const playerDropObjectSchema = eventSchema<RawPlayerDropObjectEvent>(
  "playerDropObject",
  {
    player: playerSchema,
    object: { type: T },
    position: { type: T },
  },
  ["player", "object", "position"],
);

const playerExtinguishedSchema = eventSchema<RawPlayerExtinguishedEvent>(
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

const lostUberAdvantageSchema = eventSchema<RawLostUberAdvantageEvent>(
  "lostUberAdvantage",
  {
    player: playerSchema,
    time: { type: I },
  },
  ["player", "time"],
);

// ─── Chat events ─────────────────────────────────────────

const saySchema = eventSchema<RawSayEvent>(
  "say",
  {
    player: playerSchema,
    message: { type: T },
  },
  ["player", "message"],
);

const sayTeamSchema = eventSchema<RawSayTeamEvent>(
  "sayTeam",
  {
    player: playerSchema,
    message: { type: T },
  },
  ["player", "message"],
);

// ─── Non-triggered player events ─────────────────────────

const suicideSchema = eventSchema<RawSuicideEvent>(
  "suicide",
  {
    player: playerSchema,
    weapon: { type: T },
    attackerPosition: { type: T },
  },
  ["player", "weapon", "attackerPosition"],
);

const positionReportSchema = eventSchema<RawPositionReportEvent>(
  "positionReport",
  {
    player: playerSchema,
    position: { type: T },
  },
  ["player", "position"],
);

const joinedTeamSchema = eventSchema<RawJoinedTeamEvent>(
  "joinedTeam",
  {
    player: playerSchema,
    newTeam: { type: T },
  },
  ["player", "newTeam"],
);

const connectedSchema = eventSchema<RawConnectedEvent>(
  "connected",
  {
    player: playerSchema,
    address: { type: T },
  },
  ["player", "address"],
);

const enteredGameSchema = eventSchema<RawEnteredGameEvent>(
  "enteredGame",
  {
    player: playerSchema,
  },
  ["player"],
);

const disconnectedSchema = eventSchema<RawDisconnectedEvent>(
  "disconnected",
  {
    player: playerSchema,
    reason: { type: T },
  },
  ["player", "reason"],
);

const steamUserIdValidatedSchema = eventSchema<RawSteamUserIdValidatedEvent>(
  "steamUserIdValidated",
  {
    player: playerSchema,
  },
  ["player"],
);

const changedNameSchema = eventSchema<RawChangedNameEvent>(
  "changedName",
  {
    player: playerSchema,
    newName: { type: T },
  },
  ["player", "newName"],
);

// ─── World / round events ────────────────────────────────

const roundStartSchema = eventSchema<RawRoundStartEvent>("roundStart", {}, []);
const roundSetupBeginSchema = eventSchema<RawRoundSetupBeginEvent>(
  "roundSetupBegin",
  {},
  [],
);
const roundSetupEndSchema = eventSchema<RawRoundSetupEndEvent>(
  "roundSetupEnd",
  {},
  [],
);
const roundOvertimeSchema = eventSchema<RawRoundOvertimeEvent>(
  "roundOvertime",
  {},
  [],
);
const roundStalemateSchema = eventSchema<RawRoundStalemateEvent>(
  "roundStalemate",
  {},
  [],
);

const roundWinSchema = eventSchema<RawRoundWinEvent>(
  "roundWin",
  {
    winner: { type: T },
  },
  ["winner"],
);

const roundLengthSchema = eventSchema<RawRoundLengthEvent>(
  "roundLength",
  {
    seconds: { type: N },
  },
  ["seconds"],
);

const gameOverSchema = eventSchema<RawGameOverEvent>(
  "gameOver",
  {
    reason: { type: T },
  },
  ["reason"],
);

const worldMetaDataSchema = eventSchema<RawWorldMetaDataEvent>(
  "worldMetaData",
  {
    key: { type: T },
    value: { type: T },
  },
  ["key", "value"],
);

// ─── Team events ─────────────────────────────────────────

const pointCapturedSchema = eventSchema<RawPointCapturedEvent>(
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

const currentScoreSchema = eventSchema<RawCurrentScoreEvent>(
  "currentScore",
  {
    team: { type: T },
    score: { type: I },
    numPlayers: { type: I },
  },
  ["team", "score", "numPlayers"],
);

const finalScoreSchema = eventSchema<RawFinalScoreEvent>(
  "finalScore",
  {
    team: { type: T },
    score: { type: I },
    numPlayers: { type: I },
  },
  ["team", "score", "numPlayers"],
);

const intermissionWinLimitSchema = eventSchema<RawIntermissionWinLimitEvent>(
  "intermissionWinLimit",
  {
    team: { type: T },
  },
  ["team"],
);

// ─── Pause events ────────────────────────────────────────

const matchPauseSchema = eventSchema<RawMatchPauseEvent>(
  "matchPause",
  {
    player: playerSchema,
  },
  ["player"],
);

const matchUnpauseSchema = eventSchema<RawMatchUnpauseEvent>(
  "matchUnpause",
  {
    player: playerSchema,
  },
  ["player"],
);

const gamePausedSchema = eventSchema<RawGamePausedEvent>("gamePaused", {}, []);
const gameUnpausedSchema = eventSchema<RawGameUnpausedEvent>(
  "gameUnpaused",
  {},
  [],
);

const pauseLengthSchema = eventSchema<RawPauseLengthEvent>(
  "pauseLength",
  {
    seconds: { type: N },
  },
  ["seconds"],
);

// ─── Passtime events ─────────────────────────────────────

const passGetSchema = eventSchema<RawPassGetEvent>(
  "passGet",
  {
    player: playerSchema,
    firstcontact: { type: B },
    position: { type: T },
  },
  ["player", "firstcontact", "position"],
);

const passFreeSchema = eventSchema<RawPassFreeEvent>(
  "passFree",
  {
    player: playerSchema,
    position: { type: T },
  },
  ["player", "position"],
);

const passPassCaughtSchema = eventSchema<RawPassPassCaughtEvent>(
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

const passScoreSchema = eventSchema<RawPassScoreEvent>(
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

const passScoreAssistSchema = eventSchema<RawPassScoreAssistEvent>(
  "passScoreAssist",
  {
    player: playerSchema,
    position: { type: T },
  },
  ["player", "position"],
);

const passBallStolenSchema = eventSchema<RawPassBallStolenEvent>(
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

const catapultSchema = eventSchema<RawCatapultEvent>(
  "catapult",
  {
    player: playerSchema,
    catapult: { type: T },
    position: { type: T },
  },
  ["player", "catapult", "position"],
);

const passtimeBallSpawnedSchema = eventSchema<RawPasstimeBallSpawnedEvent>(
  "passtimeBallSpawned",
  {
    location: { type: T },
  },
  ["location"],
);

const passtimeBallDamageSchema = eventSchema<RawPasstimeBallDamageEvent>(
  "passtimeBallDamage",
  {
    details: { type: T },
  },
  ["details"],
);

const panaceaCheckSchema = eventSchema<RawPanaceaCheckEvent>(
  "panaceaCheck",
  {
    details: { type: T },
  },
  ["details"],
);

// ─── System / plugin events ──────────────────────────────

const serverPluginMessageSchema = eventSchema<RawServerPluginMessageEvent>(
  "serverPluginMessage",
  {
    plugin: { type: T },
    message: { type: T },
  },
  ["plugin", "message"],
);

const printingForClientSchema = eventSchema<RawPrintingForClientEvent>(
  "printingForClient",
  {
    client: { type: I },
  },
  ["client"],
);

// ─── Spawn / name variants ───────────────────────────────

const spawnedMFilterSchema = eventSchema<RawSpawnedMFilterEvent>(
  "spawnedMFilter",
  {
    player: playerSchema,
    role: { type: T, nullable: true },
  },
  ["player"],
);

const chargedMFilterSchema = eventSchema<RawChargedMFilterEvent>(
  "chargedMFilter",
  {
    player: playerSchema,
    role: { type: T },
  },
  ["player", "role"],
);

// ─── Meta ────────────────────────────────────────────────

const metaSchema = eventSchema<RawMetaEvent>(
  "meta",
  {
    label: { type: T },
    kvs: {
      type: "object" as const,
      additionalProperties: { type: T },
    },
  },
  ["label", "kvs"],
);

// ─── Fallback ────────────────────────────────────────────

const unknownSchema = eventSchema<RawUnknownEvent>(
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
    roundStalemateSchema,
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
    disconnectedSchema,
    steamUserIdValidatedSchema,
    serverPluginMessageSchema,
    worldMetaDataSchema,
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
    metaSchema,
    unknownSchema,
  ],
};

export const validateRawTfLogEvent =
  ajv.compile<RawTfLogEvent>(tfLogEventSchema);
