export interface Player {
  name: string;
  entityId: number;
  steamId: string;
  team: string;
}

interface BaseEvent {
  timestamp: Date;
  raw: string;
}

export interface ChangedRoleEvent extends BaseEvent {
  type: "changedRole";
  player: Player;
  role: string;
}

export interface DamageEvent extends BaseEvent {
  type: "damage";
  player: Player;
  victim: Player;
  damage: number;
  realdamage?: number;
  weapon: string;
  crit?: "crit" | "mini";
  headshot?: boolean;
  airshot?: boolean;
  height?: number;
  healing?: number;
}

export interface ShotFiredEvent extends BaseEvent {
  type: "shotFired";
  player: Player;
  weapon: string;
}

export interface ShotHitEvent extends BaseEvent {
  type: "shotHit";
  player: Player;
  weapon: string;
}

export interface PickedUpItemEvent extends BaseEvent {
  type: "pickedUpItem";
  player: Player;
  item: string;
  healing?: number;
}

export interface KillEvent extends BaseEvent {
  type: "kill";
  player: Player;
  victim: Player;
  weapon: string;
  customkill?: string;
  attackerPosition: string;
  victimPosition: string;
}

export interface MedicDeathEvent extends BaseEvent {
  type: "medicDeath";
  player: Player;
  victim: Player;
  healing: number;
  ubercharge: number;
}

export interface MedicDeathExEvent extends BaseEvent {
  type: "medicDeathEx";
  player: Player;
  uberpct: number;
}

export interface SpawnedEvent extends BaseEvent {
  type: "spawned";
  player: Player;
  role: string;
}

export interface RoundStartEvent extends BaseEvent {
  type: "roundStart";
}

export interface RoundSetupBeginEvent extends BaseEvent {
  type: "roundSetupBegin";
}

export interface RoundSetupEndEvent extends BaseEvent {
  type: "roundSetupEnd";
}

export interface RoundWinEvent extends BaseEvent {
  type: "roundWin";
  winner: string;
}

export interface RoundLengthEvent extends BaseEvent {
  type: "roundLength";
  seconds: number;
}

export interface RoundOvertimeEvent extends BaseEvent {
  type: "roundOvertime";
}

export interface GameOverEvent extends BaseEvent {
  type: "gameOver";
  reason: string;
}

export interface EmptyUberEvent extends BaseEvent {
  type: "emptyUber";
  player: Player;
}

export interface HealedEvent extends BaseEvent {
  type: "healed";
  player: Player;
  target: Player;
  healing: number;
  airshot?: boolean;
  height?: number;
}

export interface SayEvent extends BaseEvent {
  type: "say";
  player: Player;
  message: string;
}

export interface SayTeamEvent extends BaseEvent {
  type: "sayTeam";
  player: Player;
  message: string;
}

export interface KillAssistEvent extends BaseEvent {
  type: "killAssist";
  player: Player;
  victim: Player;
  assisterPosition: string;
  attackerPosition: string;
  victimPosition: string;
}

export interface PlayerBuiltObjectEvent extends BaseEvent {
  type: "playerBuiltObject";
  player: Player;
  object: string;
  position: string;
}

export interface PointCapturedEvent extends BaseEvent {
  type: "pointCaptured";
  team: string;
  cp: number;
  cpname: string;
  numcappers: number;
  players: { player: string; position: string }[];
}

export interface CurrentScoreEvent extends BaseEvent {
  type: "currentScore";
  team: string;
  score: number;
  numPlayers: number;
}

export interface FinalScoreEvent extends BaseEvent {
  type: "finalScore";
  team: string;
  score: number;
  numPlayers: number;
}

export interface SuicideEvent extends BaseEvent {
  type: "suicide";
  player: Player;
  weapon: string;
  attackerPosition: string;
}

export interface PositionReportEvent extends BaseEvent {
  type: "positionReport";
  player: Player;
  position: string;
}

export interface DemosTfEvent extends BaseEvent {
  type: "demosTf";
  message: string;
}

export interface ChargeReadyEvent extends BaseEvent {
  type: "chargeReady";
  player: Player;
}

export interface ChargeDeployedEvent extends BaseEvent {
  type: "chargeDeployed";
  player: Player;
  medigun: string;
}

export interface ChargeEndedEvent extends BaseEvent {
  type: "chargeEnded";
  player: Player;
  duration: number;
}

export interface FirstHealAfterSpawnEvent extends BaseEvent {
  type: "firstHealAfterSpawn";
  player: Player;
  time: number;
}

export interface DominationEvent extends BaseEvent {
  type: "domination";
  player: Player;
  victim: Player;
  assist?: boolean;
}

export interface RevengeEvent extends BaseEvent {
  type: "revenge";
  player: Player;
  victim: Player;
  assist?: boolean;
}

export interface CaptureBlockedEvent extends BaseEvent {
  type: "captureBlocked";
  player: Player;
  cp: number;
  cpname: string;
  position: string;
}

export interface KilledObjectEvent extends BaseEvent {
  type: "killedObject";
  player: Player;
  object: string;
  weapon: string;
  objectowner: string;
  attackerPosition: string;
  assist?: boolean;
  assisterPosition?: string;
}

export interface ObjectDetonatedEvent extends BaseEvent {
  type: "objectDetonated";
  player: Player;
  object: string;
  position: string;
}

export interface PlayerCarryObjectEvent extends BaseEvent {
  type: "playerCarryObject";
  player: Player;
  object: string;
  position: string;
}

export interface PlayerDropObjectEvent extends BaseEvent {
  type: "playerDropObject";
  player: Player;
  object: string;
  position: string;
}

export interface PlayerExtinguishedEvent extends BaseEvent {
  type: "playerExtinguished";
  player: Player;
  victim: Player;
  weapon: string;
  attackerPosition: string;
  victimPosition: string;
}

export interface LostUberAdvantageEvent extends BaseEvent {
  type: "lostUberAdvantage";
  player: Player;
  time: number;
}

export interface JoinedTeamEvent extends BaseEvent {
  type: "joinedTeam";
  player: Player;
  newTeam: string;
}

export interface ConnectedEvent extends BaseEvent {
  type: "connected";
  player: Player;
  address: string;
}

export interface EnteredGameEvent extends BaseEvent {
  type: "enteredGame";
  player: Player;
}

// ─── Pause events ─────────────────────────────────────────

export interface MatchPauseEvent extends BaseEvent {
  type: "matchPause";
  player: Player;
}

export interface MatchUnpauseEvent extends BaseEvent {
  type: "matchUnpause";
  player: Player;
}

export interface GamePausedEvent extends BaseEvent {
  type: "gamePaused";
}

export interface GameUnpausedEvent extends BaseEvent {
  type: "gameUnpaused";
}

export interface PauseLengthEvent extends BaseEvent {
  type: "pauseLength";
  seconds: number;
}

// ─── Passtime events ──────────────────────────────────────

export interface PassGetEvent extends BaseEvent {
  type: "passGet";
  player: Player;
  firstcontact: boolean;
  position: string;
}

export interface PassFreeEvent extends BaseEvent {
  type: "passFree";
  player: Player;
  position: string;
}

export interface PassPassCaughtEvent extends BaseEvent {
  type: "passPassCaught";
  player: Player;
  target: Player;
  interception: boolean;
  save: boolean;
  handoff: boolean;
  dist: number;
  duration: number;
  throwerPosition: string;
  catcherPosition: string;
}

export interface PassScoreEvent extends BaseEvent {
  type: "passScore";
  player: Player;
  points: number;
  panacea: boolean;
  winStrat: boolean;
  deathbomb: boolean;
  dist: number;
  position: string;
}

export interface PassScoreAssistEvent extends BaseEvent {
  type: "passScoreAssist";
  player: Player;
  position: string;
}

export interface PassBallStolenEvent extends BaseEvent {
  type: "passBallStolen";
  player: Player;
  victim: Player;
  stealDefense: boolean;
  thiefPosition: string;
  victimPosition: string;
}

export interface CatapultEvent extends BaseEvent {
  type: "catapult";
  player: Player;
  catapult: string;
  position: string;
}

export interface PasstimeBallSpawnedEvent extends BaseEvent {
  type: "passtimeBallSpawned";
  location: string;
}

export interface PasstimeBallDamageEvent extends BaseEvent {
  type: "passtimeBallDamage";
  details: string;
}

export interface PanaceaCheckEvent extends BaseEvent {
  type: "panaceaCheck";
  details: string;
}

export interface PrintingForClientEvent extends BaseEvent {
  type: "printingForClient";
  client: number;
}

// ─── Spawn / name variants ────────────────────────────────

export interface SpawnedMFilterEvent extends BaseEvent {
  type: "spawnedMFilter";
  player: Player;
  role?: string;
}

export interface ChargedMFilterEvent extends BaseEvent {
  type: "chargedMFilter";
  player: Player;
  role: string;
}

export interface ChangedNameEvent extends BaseEvent {
  type: "changedName";
  player: Player;
  newName: string;
}

export interface IntermissionWinLimitEvent extends BaseEvent {
  type: "intermissionWinLimit";
  team: string;
}

export interface UnknownEvent extends BaseEvent {
  type: "unknown";
  body: string;
}

export type TfLogEvent =
  | ChangedRoleEvent
  | DamageEvent
  | ShotFiredEvent
  | ShotHitEvent
  | PickedUpItemEvent
  | KillEvent
  | MedicDeathEvent
  | MedicDeathExEvent
  | SpawnedEvent
  | RoundStartEvent
  | RoundSetupBeginEvent
  | RoundSetupEndEvent
  | RoundWinEvent
  | RoundLengthEvent
  | RoundOvertimeEvent
  | GameOverEvent
  | EmptyUberEvent
  | HealedEvent
  | SayEvent
  | SayTeamEvent
  | KillAssistEvent
  | PlayerBuiltObjectEvent
  | PointCapturedEvent
  | CurrentScoreEvent
  | FinalScoreEvent
  | SuicideEvent
  | PositionReportEvent
  | DemosTfEvent
  | ChargeReadyEvent
  | ChargeDeployedEvent
  | ChargeEndedEvent
  | FirstHealAfterSpawnEvent
  | DominationEvent
  | RevengeEvent
  | CaptureBlockedEvent
  | KilledObjectEvent
  | ObjectDetonatedEvent
  | PlayerCarryObjectEvent
  | PlayerDropObjectEvent
  | PlayerExtinguishedEvent
  | LostUberAdvantageEvent
  | JoinedTeamEvent
  | ConnectedEvent
  | EnteredGameEvent
  | MatchPauseEvent
  | MatchUnpauseEvent
  | GamePausedEvent
  | GameUnpausedEvent
  | PauseLengthEvent
  | PassGetEvent
  | PassFreeEvent
  | PassPassCaughtEvent
  | PassScoreEvent
  | PassScoreAssistEvent
  | PassBallStolenEvent
  | CatapultEvent
  | PasstimeBallSpawnedEvent
  | PasstimeBallDamageEvent
  | PanaceaCheckEvent
  | PrintingForClientEvent
  | SpawnedMFilterEvent
  | ChargedMFilterEvent
  | ChangedNameEvent
  | IntermissionWinLimitEvent
  | UnknownEvent;
