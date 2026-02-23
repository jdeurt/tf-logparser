export interface Player {
  name: string;
  entityId: number;
  steamId: string;
  team: string;
}

export interface RawBaseEvent {
  timestamp: number;
  lineNumber: number;
}

export interface RawChangedRoleEvent extends RawBaseEvent {
  type: "changedRole";
  player: Player;
  role: string;
}

export interface RawDamageEvent extends RawBaseEvent {
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

export interface RawShotFiredEvent extends RawBaseEvent {
  type: "shotFired";
  player: Player;
  weapon: string;
}

export interface RawShotHitEvent extends RawBaseEvent {
  type: "shotHit";
  player: Player;
  weapon: string;
}

export interface RawPickedUpItemEvent extends RawBaseEvent {
  type: "pickedUpItem";
  player: Player;
  item: string;
  healing?: number;
}

export interface RawKillEvent extends RawBaseEvent {
  type: "kill";
  player: Player;
  victim: Player;
  weapon: string;
  customkill?: string;
  attackerPosition: string;
  victimPosition: string;
}

export interface RawMedicDeathEvent extends RawBaseEvent {
  type: "medicDeath";
  player: Player;
  victim: Player;
  healing: number;
  ubercharge: number;
}

export interface RawMedicDeathExEvent extends RawBaseEvent {
  type: "medicDeathEx";
  player: Player;
  uberpct: number;
}

export interface RawSpawnedEvent extends RawBaseEvent {
  type: "spawned";
  player: Player;
  role: string;
}

export interface RawRoundStartEvent extends RawBaseEvent {
  type: "roundStart";
}

export interface RawRoundSetupBeginEvent extends RawBaseEvent {
  type: "roundSetupBegin";
}

export interface RawRoundSetupEndEvent extends RawBaseEvent {
  type: "roundSetupEnd";
}

export interface RawRoundWinEvent extends RawBaseEvent {
  type: "roundWin";
  winner: string;
}

export interface RawRoundLengthEvent extends RawBaseEvent {
  type: "roundLength";
  seconds: number;
}

export interface RawRoundOvertimeEvent extends RawBaseEvent {
  type: "roundOvertime";
}

export interface RawRoundStalemateEvent extends RawBaseEvent {
  type: "roundStalemate";
}

export interface RawGameOverEvent extends RawBaseEvent {
  type: "gameOver";
  reason: string;
}

export interface RawEmptyUberEvent extends RawBaseEvent {
  type: "emptyUber";
  player: Player;
}

export interface RawHealedEvent extends RawBaseEvent {
  type: "healed";
  player: Player;
  target: Player;
  healing: number;
  airshot?: boolean;
  height?: number;
}

export interface RawSayEvent extends RawBaseEvent {
  type: "say";
  player: Player;
  message: string;
}

export interface RawSayTeamEvent extends RawBaseEvent {
  type: "sayTeam";
  player: Player;
  message: string;
}

export interface RawKillAssistEvent extends RawBaseEvent {
  type: "killAssist";
  player: Player;
  victim: Player;
  assisterPosition: string;
  attackerPosition: string;
  victimPosition: string;
}

export interface RawPlayerBuiltObjectEvent extends RawBaseEvent {
  type: "playerBuiltObject";
  player: Player;
  object: string;
  position: string;
}

export interface RawPointCapturedEvent extends RawBaseEvent {
  type: "pointCaptured";
  team: string;
  cp: number;
  cpname: string;
  numcappers: number;
  players: { player: string; position: string }[];
}

export interface RawCurrentScoreEvent extends RawBaseEvent {
  type: "currentScore";
  team: string;
  score: number;
  numPlayers: number;
}

export interface RawFinalScoreEvent extends RawBaseEvent {
  type: "finalScore";
  team: string;
  score: number;
  numPlayers: number;
}

export interface RawSuicideEvent extends RawBaseEvent {
  type: "suicide";
  player: Player;
  weapon: string;
  attackerPosition: string;
}

export interface RawPositionReportEvent extends RawBaseEvent {
  type: "positionReport";
  player: Player;
  position: string;
}

export interface RawChargeReadyEvent extends RawBaseEvent {
  type: "chargeReady";
  player: Player;
}

export interface RawChargeDeployedEvent extends RawBaseEvent {
  type: "chargeDeployed";
  player: Player;
  medigun: string;
}

export interface RawChargeEndedEvent extends RawBaseEvent {
  type: "chargeEnded";
  player: Player;
  duration: number;
}

export interface RawFirstHealAfterSpawnEvent extends RawBaseEvent {
  type: "firstHealAfterSpawn";
  player: Player;
  time: number;
}

export interface RawDominationEvent extends RawBaseEvent {
  type: "domination";
  player: Player;
  victim: Player;
  assist?: boolean;
}

export interface RawRevengeEvent extends RawBaseEvent {
  type: "revenge";
  player: Player;
  victim: Player;
  assist?: boolean;
}

export interface RawCaptureBlockedEvent extends RawBaseEvent {
  type: "captureBlocked";
  player: Player;
  cp: number;
  cpname: string;
  position: string;
}

export interface RawKilledObjectEvent extends RawBaseEvent {
  type: "killedObject";
  player: Player;
  object: string;
  weapon?: string;
  objectowner: string;
  attackerPosition: string;
  assist?: boolean;
  assisterPosition?: string;
}

export interface RawObjectDetonatedEvent extends RawBaseEvent {
  type: "objectDetonated";
  player: Player;
  object: string;
  position: string;
}

export interface RawPlayerCarryObjectEvent extends RawBaseEvent {
  type: "playerCarryObject";
  player: Player;
  object: string;
  position: string;
}

export interface RawPlayerDropObjectEvent extends RawBaseEvent {
  type: "playerDropObject";
  player: Player;
  object: string;
  position: string;
}

export interface RawPlayerExtinguishedEvent extends RawBaseEvent {
  type: "playerExtinguished";
  player: Player;
  victim: Player;
  weapon: string;
  attackerPosition: string;
  victimPosition: string;
}

export interface RawLostUberAdvantageEvent extends RawBaseEvent {
  type: "lostUberAdvantage";
  player: Player;
  time: number;
}

export interface RawJoinedTeamEvent extends RawBaseEvent {
  type: "joinedTeam";
  player: Player;
  newTeam: string;
}

export interface RawConnectedEvent extends RawBaseEvent {
  type: "connected";
  player: Player;
  address: string;
}

export interface RawEnteredGameEvent extends RawBaseEvent {
  type: "enteredGame";
  player: Player;
}

export interface RawDisconnectedEvent extends RawBaseEvent {
  type: "disconnected";
  player: Player;
  reason: string;
}

export interface RawSteamUserIdValidatedEvent extends RawBaseEvent {
  type: "steamUserIdValidated";
  player: Player;
}

export interface RawServerPluginMessageEvent extends RawBaseEvent {
  type: "serverPluginMessage";
  plugin: string;
  message: string;
}

export interface RawWorldMetaDataEvent extends RawBaseEvent {
  type: "worldMetaData";
  key: string;
  value: string;
}

// ─── Pause events ─────────────────────────────────────────

export interface RawMatchPauseEvent extends RawBaseEvent {
  type: "matchPause";
  player: Player;
}

export interface RawMatchUnpauseEvent extends RawBaseEvent {
  type: "matchUnpause";
  player: Player;
}

export interface RawGamePausedEvent extends RawBaseEvent {
  type: "gamePaused";
}

export interface RawGameUnpausedEvent extends RawBaseEvent {
  type: "gameUnpaused";
}

export interface RawPauseLengthEvent extends RawBaseEvent {
  type: "pauseLength";
  seconds: number;
}

// ─── Passtime events ──────────────────────────────────────

export interface RawPassGetEvent extends RawBaseEvent {
  type: "passGet";
  player: Player;
  firstcontact: boolean;
  position: string;
}

export interface RawPassFreeEvent extends RawBaseEvent {
  type: "passFree";
  player: Player;
  position: string;
}

export interface RawPassPassCaughtEvent extends RawBaseEvent {
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

export interface RawPassScoreEvent extends RawBaseEvent {
  type: "passScore";
  player: Player;
  points: number;
  panacea: boolean;
  winStrat: boolean;
  deathbomb: boolean;
  dist: number;
  position: string;
}

export interface RawPassScoreAssistEvent extends RawBaseEvent {
  type: "passScoreAssist";
  player: Player;
  position: string;
}

export interface RawPassBallStolenEvent extends RawBaseEvent {
  type: "passBallStolen";
  player: Player;
  victim: Player;
  stealDefense: boolean;
  thiefPosition: string;
  victimPosition: string;
}

export interface RawCatapultEvent extends RawBaseEvent {
  type: "catapult";
  player: Player;
  catapult: string;
  position: string;
}

export interface RawPasstimeBallSpawnedEvent extends RawBaseEvent {
  type: "passtimeBallSpawned";
  location: string;
}

export interface RawPasstimeBallDamageEvent extends RawBaseEvent {
  type: "passtimeBallDamage";
  details: string;
}

export interface RawPanaceaCheckEvent extends RawBaseEvent {
  type: "panaceaCheck";
  details: string;
}

export interface RawPrintingForClientEvent extends RawBaseEvent {
  type: "printingForClient";
  client: number;
}

// ─── Spawn / name variants ────────────────────────────────

export interface RawSpawnedMFilterEvent extends RawBaseEvent {
  type: "spawnedMFilter";
  player: Player;
  role?: string;
}

export interface RawChargedMFilterEvent extends RawBaseEvent {
  type: "chargedMFilter";
  player: Player;
  role: string;
}

export interface RawChangedNameEvent extends RawBaseEvent {
  type: "changedName";
  player: Player;
  newName: string;
}

export interface RawIntermissionWinLimitEvent extends RawBaseEvent {
  type: "intermissionWinLimit";
  team: string;
}

export interface RawMetaEvent extends RawBaseEvent {
  type: "meta";
  label: string;
  kvs: Record<string, string>;
}

export interface RawUnknownEvent extends RawBaseEvent {
  type: "unknown";
  body: string;
}

export type RawTfLogEvent =
  | RawChangedRoleEvent
  | RawDamageEvent
  | RawShotFiredEvent
  | RawShotHitEvent
  | RawPickedUpItemEvent
  | RawKillEvent
  | RawMedicDeathEvent
  | RawMedicDeathExEvent
  | RawSpawnedEvent
  | RawRoundStartEvent
  | RawRoundSetupBeginEvent
  | RawRoundSetupEndEvent
  | RawRoundWinEvent
  | RawRoundLengthEvent
  | RawRoundOvertimeEvent
  | RawRoundStalemateEvent
  | RawGameOverEvent
  | RawEmptyUberEvent
  | RawHealedEvent
  | RawSayEvent
  | RawSayTeamEvent
  | RawKillAssistEvent
  | RawPlayerBuiltObjectEvent
  | RawPointCapturedEvent
  | RawCurrentScoreEvent
  | RawFinalScoreEvent
  | RawSuicideEvent
  | RawPositionReportEvent
  | RawChargeReadyEvent
  | RawChargeDeployedEvent
  | RawChargeEndedEvent
  | RawFirstHealAfterSpawnEvent
  | RawDominationEvent
  | RawRevengeEvent
  | RawCaptureBlockedEvent
  | RawKilledObjectEvent
  | RawObjectDetonatedEvent
  | RawPlayerCarryObjectEvent
  | RawPlayerDropObjectEvent
  | RawPlayerExtinguishedEvent
  | RawLostUberAdvantageEvent
  | RawJoinedTeamEvent
  | RawConnectedEvent
  | RawEnteredGameEvent
  | RawDisconnectedEvent
  | RawSteamUserIdValidatedEvent
  | RawServerPluginMessageEvent
  | RawWorldMetaDataEvent
  | RawMatchPauseEvent
  | RawMatchUnpauseEvent
  | RawGamePausedEvent
  | RawGameUnpausedEvent
  | RawPauseLengthEvent
  | RawPassGetEvent
  | RawPassFreeEvent
  | RawPassPassCaughtEvent
  | RawPassScoreEvent
  | RawPassScoreAssistEvent
  | RawPassBallStolenEvent
  | RawCatapultEvent
  | RawPasstimeBallSpawnedEvent
  | RawPasstimeBallDamageEvent
  | RawPanaceaCheckEvent
  | RawPrintingForClientEvent
  | RawSpawnedMFilterEvent
  | RawChargedMFilterEvent
  | RawChangedNameEvent
  | RawIntermissionWinLimitEvent
  | RawMetaEvent
  | RawUnknownEvent;
