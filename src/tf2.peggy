{{
// Per-parse initializer — has access to `input` and `options`
}}

Line
  = timestamp:Timestamp " " event:Event
    { return { timestamp, raw: input, ...event }; }

// ─── Timestamp ─────────────────────────────────────────────

Timestamp
  = "L " month:$([0-9][0-9]) "/" day:$([0-9][0-9]) "/" year:$([0-9][0-9][0-9][0-9])
    " - " hour:$([0-9][0-9]) ":" min:$([0-9][0-9]) ":" sec:$([0-9][0-9]) ":"
    {
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(min, 10),
        parseInt(sec, 10)
      );
    }

// ─── Events (ordered alternatives) ────────────────────────

Event
  = DamageEvent
  / MedicDeathEvent
  / HealedEvent
  / ShotFiredEvent
  / ShotHitEvent
  / EmptyUberEvent
  / ChargeReadyEvent
  / ChargeDeployedEvent
  / ChargeEndedEvent
  / FirstHealAfterSpawnEvent
  / KillAssistEvent
  / DominationEvent
  / RevengeEvent
  / CaptureBlockedEvent
  / PlayerBuiltObjectEvent
  / KilledObjectEvent
  / ObjectDetonatedEvent
  / PlayerCarryObjectEvent
  / PlayerDropObjectEvent
  / PlayerExtinguishedEvent
  / LostUberAdvantageEvent
  / MatchPauseEvent
  / MatchUnpauseEvent
  / PassGetEvent
  / PassFreeEvent
  / PassPassCaughtEvent
  / PassScoreEvent
  / PassScoreAssistEvent
  / PassBallStolenEvent
  / CatapultEvent
  / MedicDeathExEvent
  / KillEvent
  / SuicideEvent
  / SpawnedMFilterEvent
  / SpawnedAsMFilterEvent
  / ChargedAsMFilterEvent
  / SpawnedEvent
  / ChangedRoleEvent
  / ChangedNameEvent
  / PickedUpItemEvent
  / SayTeamEvent
  / SayEvent
  / PositionReportEvent
  / JoinedTeamEvent
  / ConnectedEvent
  / EnteredGameEvent
  / PointCapturedEvent
  / IntermissionWinLimitEvent
  / RoundStartEvent
  / RoundSetupBeginEvent
  / RoundSetupEndEvent
  / RoundWinEvent
  / RoundLengthEvent
  / RoundOvertimeEvent
  / GameOverEvent
  / GamePausedEvent
  / GameUnpausedEvent
  / PauseLengthEvent
  / CurrentScoreEvent
  / FinalScoreEvent
  / DemosTfEvent
  / PasstimeBallSpawnedEvent
  / PasstimeBallDamageEvent
  / PanaceaCheckEvent
  / PrintingForClientEvent
  / UnknownEvent

// ─── Player triggered events ──────────────────────────────

DamageEvent
  = player:Player " triggered \"damage\" against " victim:Player " " kvs:DamageKVs
    {
      const result = { type: "damage", player, victim, damage: kvs.damage, weapon: kvs.weapon };
      if (kvs.realdamage !== undefined) result.realdamage = kvs.realdamage;
      if (kvs.crit !== undefined) result.crit = kvs.crit;
      if (kvs.headshot !== undefined) result.headshot = true;
      if (kvs.airshot !== undefined) result.airshot = true;
      if (kvs.height !== undefined) result.height = kvs.height;
      if (kvs.healing !== undefined) result.healing = kvs.healing;
      return result;
    }

DamageKVs
  = pairs:DamageKV+
    {
      const obj = {};
      for (const [k, v] of pairs) obj[k] = v;
      return obj;
    }

DamageKV
  = "(damage \"" v:$[0-9]+ "\")" _? { return ["damage", parseInt(v, 10)]; }
  / "(realdamage \"" v:$[0-9]+ "\")" _? { return ["realdamage", parseInt(v, 10)]; }
  / "(weapon \"" v:$[^\"]+ "\")" _? { return ["weapon", v]; }
  / "(crit \"" v:$("crit" / "mini") "\")" _? { return ["crit", v]; }
  / "(headshot \"1\")" _? { return ["headshot", true]; }
  / "(airshot \"1\")" _? { return ["airshot", true]; }
  / "(height \"" v:$[0-9]+ "\")" _? { return ["height", parseInt(v, 10)]; }
  / "(healing \"" v:$[0-9]+ "\")" _? { return ["healing", parseInt(v, 10)]; }

MedicDeathEvent
  = player:Player " triggered \"medic_death\" against " victim:Player
    " (healing \"" healing:$[0-9]+ "\") (ubercharge \"" ubercharge:$[0-9]+ "\")"
    {
      return {
        type: "medicDeath",
        player,
        victim,
        healing: parseInt(healing, 10),
        ubercharge: parseInt(ubercharge, 10)
      };
    }

HealedEvent
  = player:Player " triggered \"healed\" against " target:Player " (healing \"" healing:$[0-9]+ "\")" rest:HealedOptionals
    {
      const result = { type: "healed", player, target, healing: parseInt(healing, 10) };
      if (rest.airshot) result.airshot = true;
      if (rest.height !== undefined) result.height = rest.height;
      return result;
    }

HealedOptionals
  = " (airshot \"1\") (height \"" h:$[0-9]+ "\")" { return { airshot: true, height: parseInt(h, 10) }; }
  / "" { return {}; }

ShotFiredEvent
  = player:Player " triggered \"shot_fired\" (weapon \"" weapon:$[^\"]+ "\")"
    { return { type: "shotFired", player, weapon }; }

ShotHitEvent
  = player:Player " triggered \"shot_hit\" (weapon \"" weapon:$[^\"]+ "\")"
    { return { type: "shotHit", player, weapon }; }

EmptyUberEvent
  = player:Player " triggered \"empty_uber\""
    { return { type: "emptyUber", player }; }

ChargeReadyEvent
  = player:Player " triggered \"chargeready\""
    { return { type: "chargeReady", player }; }

ChargeDeployedEvent
  = player:Player " triggered \"chargedeployed\" (medigun \"" medigun:$[^\"]+ "\")"
    { return { type: "chargeDeployed", player, medigun }; }

ChargeEndedEvent
  = player:Player " triggered \"chargeended\" (duration \"" duration:$[0-9.]+ "\")"
    { return { type: "chargeEnded", player, duration: parseFloat(duration) }; }

FirstHealAfterSpawnEvent
  = player:Player " triggered \"first_heal_after_spawn\" (time \"" time:$[0-9.]+ "\")"
    { return { type: "firstHealAfterSpawn", player, time: parseFloat(time) }; }

KillAssistEvent
  = player:Player " triggered \"kill assist\" against " victim:Player
    " (assister_position \"" assisterPos:$[^\"]+ "\")"
    " (attacker_position \"" attackerPos:$[^\"]+ "\")"
    " (victim_position \"" victimPos:$[^\"]+ "\")"
    {
      return {
        type: "killAssist",
        player,
        victim,
        assisterPosition: assisterPos,
        attackerPosition: attackerPos,
        victimPosition: victimPos
      };
    }

DominationEvent
  = player:Player " triggered \"domination\" against " victim:Player assist:OptionalAssist
    {
      const result = { type: "domination", player, victim };
      if (assist) result.assist = true;
      return result;
    }

RevengeEvent
  = player:Player " triggered \"revenge\" against " victim:Player assist:OptionalAssist
    {
      const result = { type: "revenge", player, victim };
      if (assist) result.assist = true;
      return result;
    }

OptionalAssist
  = " (assist \"1\")" { return true; }
  / "" { return false; }

CaptureBlockedEvent
  = player:Player " triggered \"captureblocked\" (cp \"" cp:$[0-9]+ "\") (cpname \"" cpname:$[^\"]+ "\") (position \"" position:$[^\"]+ "\")"
    {
      return {
        type: "captureBlocked",
        player,
        cp: parseInt(cp, 10),
        cpname,
        position
      };
    }

PlayerBuiltObjectEvent
  = player:Player " triggered \"player_builtobject\" (object \"" object:$[^\"]+ "\") (position \"" position:$[^\"]+ "\")"
    { return { type: "playerBuiltObject", player, object, position }; }

KilledObjectEvent
  = player:Player " triggered \"killedobject\" " kvs:KilledObjectKVs
    {
      const result = {
        type: "killedObject",
        player,
        object: kvs.object,
        weapon: kvs.weapon || "",
        objectowner: kvs.objectowner,
        attackerPosition: kvs.attacker_position
      };
      if (kvs.assist) result.assist = true;
      if (kvs.assister_position) result.assisterPosition = kvs.assister_position;
      return result;
    }

KilledObjectKVs
  = pairs:KilledObjectKV+
    {
      const obj = {};
      for (const [k, v] of pairs) obj[k] = v;
      return obj;
    }

KilledObjectKV
  = "(object \"" v:$[^\"]+ "\")" _? { return ["object", v]; }
  / "(weapon \"" v:$[^\"]+ "\")" _? { return ["weapon", v]; }
  / "(objectowner \"" v:$[^\"]+ "\")" _? { return ["objectowner", v]; }
  / "(attacker_position \"" v:$[^\"]+ "\")" _? { return ["attacker_position", v]; }
  / "(assist \"1\")" _? { return ["assist", true]; }
  / "(assister_position \"" v:$[^\"]+ "\")" _? { return ["assister_position", v]; }

ObjectDetonatedEvent
  = player:Player " triggered \"object_detonated\" (object \"" object:$[^\"]+ "\") (position \"" position:$[^\"]+ "\")"
    { return { type: "objectDetonated", player, object, position }; }

PlayerCarryObjectEvent
  = player:Player " triggered \"player_carryobject\" (object \"" object:$[^\"]+ "\") (position \"" position:$[^\"]+ "\")"
    { return { type: "playerCarryObject", player, object, position }; }

PlayerDropObjectEvent
  = player:Player " triggered \"player_dropobject\" (object \"" object:$[^\"]+ "\") (position \"" position:$[^\"]+ "\")"
    { return { type: "playerDropObject", player, object, position }; }

PlayerExtinguishedEvent
  = player:Player " triggered \"player_extinguished\" against " victim:Player
    " with \"" weapon:$[^\"]+ "\""
    " (attacker_position \"" attackerPos:$[^\"]+ "\")"
    " (victim_position \"" victimPos:$[^\"]+ "\")"
    {
      return {
        type: "playerExtinguished",
        player,
        victim,
        weapon,
        attackerPosition: attackerPos,
        victimPosition: victimPos
      };
    }

LostUberAdvantageEvent
  = player:Player " triggered \"lost_uber_advantage\" (time \"" time:$[0-9]+ "\")"
    { return { type: "lostUberAdvantage", player, time: parseInt(time, 10) }; }

MatchPauseEvent
  = player:Player " triggered \"matchpause\""
    { return { type: "matchPause", player }; }

MatchUnpauseEvent
  = player:Player " triggered \"matchunpause\""
    { return { type: "matchUnpause", player }; }

// ─── Passtime events ──────────────────────────────────────

PassGetEvent
  = player:Player " triggered \"pass_get\" (firstcontact \"" firstcontact:$[0-9]+ "\") (position \"" position:$[^\"]+ "\")"
    { return { type: "passGet", player, firstcontact: parseInt(firstcontact, 10) === 1, position }; }

PassFreeEvent
  = player:Player " triggered \"pass_free\" (position \"" position:$[^\"]+ "\")"
    { return { type: "passFree", player, position }; }

PassPassCaughtEvent
  = player:Player " triggered \"pass_pass_caught\" against " target:Player " " kvs:PassCaughtKVs
    {
      return {
        type: "passPassCaught",
        player,
        target,
        interception: parseInt(kvs.interception, 10) === 1,
        save: parseInt(kvs.save, 10) === 1,
        handoff: parseInt(kvs.handoff, 10) === 1,
        dist: parseFloat(kvs.dist),
        duration: parseFloat(kvs.duration),
        throwerPosition: kvs.thrower_position,
        catcherPosition: kvs.catcher_position
      };
    }

PassCaughtKVs
  = pairs:PassCaughtKV+
    {
      const obj = {};
      for (const [k, v] of pairs) obj[k] = v;
      return obj;
    }

PassCaughtKV
  = "(interception \"" v:$[0-9]+ "\")" _? { return ["interception", v]; }
  / "(save \"" v:$[0-9]+ "\")" _? { return ["save", v]; }
  / "(handoff \"" v:$[0-9]+ "\")" _? { return ["handoff", v]; }
  / "(dist \"" v:$[0-9.]+ "\")" _? { return ["dist", v]; }
  / "(duration \"" v:$[0-9.]+ "\")" _? { return ["duration", v]; }
  / "(thrower_position \"" v:$[^\"]+ "\")" _? { return ["thrower_position", v]; }
  / "(catcher_position \"" v:$[^\"]+ "\")" _? { return ["catcher_position", v]; }

PassScoreEvent
  = player:Player " triggered \"pass_score\" " kvs:PassScoreKVs
    {
      return {
        type: "passScore",
        player,
        points: parseInt(kvs.points, 10),
        panacea: parseInt(kvs.panacea, 10) === 1,
        winStrat: parseInt(kvs.win_strat, 10) === 1,
        deathbomb: parseInt(kvs.deathbomb, 10) === 1,
        dist: parseInt(kvs.dist, 10),
        position: kvs.position
      };
    }

PassScoreKVs
  = pairs:PassScoreKV+
    {
      const obj = {};
      for (const [k, v] of pairs) obj[k] = v;
      return obj;
    }

PassScoreKV
  = "(points \"" v:$[0-9]+ "\")" _? { return ["points", v]; }
  / "(panacea \"" v:$[0-9]+ "\")" _? { return ["panacea", v]; }
  / "(win strat \"" v:$[0-9]+ "\")" _? { return ["win_strat", v]; }
  / "(deathbomb \"" v:$[0-9]+ "\")" _? { return ["deathbomb", v]; }
  / "(dist \"" v:$[0-9]+ "\")" _? { return ["dist", v]; }
  / "(position \"" v:$[^\"]+ "\")" _? { return ["position", v]; }

PassScoreAssistEvent
  = player:Player " triggered \"pass_score_assist\" (position \"" position:$[^\"]+ "\")"
    { return { type: "passScoreAssist", player, position }; }

PassBallStolenEvent
  = player:Player " triggered \"pass_ball_stolen\" against " victim:Player
    " (steal defense \"" stealDefense:$[0-9]+ "\")"
    " (thief_position \"" thiefPos:$[^\"]+ "\")"
    " (victim_position \"" victimPos:$[^\"]+ "\")"
    {
      return {
        type: "passBallStolen",
        player,
        victim,
        stealDefense: parseInt(stealDefense, 10) === 1,
        thiefPosition: thiefPos,
        victimPosition: victimPos
      };
    }

CatapultEvent
  = player:Player " triggered \"" catapult:$[a-z_0-9]+ "\" with the jack (position \"" position:$[^\"]+ "\")"
    { return { type: "catapult", player, catapult, position }; }

MedicDeathExEvent
  = player:Player " triggered \"medic_death_ex\" (uberpct \"" uberpct:$[0-9]+ "\")"
    { return { type: "medicDeathEx", player, uberpct: parseInt(uberpct, 10) }; }

// ─── Non-triggered player events ──────────────────────────

KillEvent
  = player:Player " killed " victim:Player " with \"" weapon:$[^\"]+ "\"" kvs:KillKVs
    {
      const result = {
        type: "kill",
        player,
        victim,
        weapon,
        attackerPosition: kvs.attacker_position,
        victimPosition: kvs.victim_position
      };
      if (kvs.customkill !== undefined) result.customkill = kvs.customkill;
      return result;
    }

KillKVs
  = pairs:KillKV+
    {
      const obj = {};
      for (const [k, v] of pairs) obj[k] = v;
      return obj;
    }

KillKV
  = " (customkill \"" v:$[^\"]+ "\")" { return ["customkill", v]; }
  / " (attacker_position \"" v:$[^\"]+ "\")" { return ["attacker_position", v]; }
  / " (victim_position \"" v:$[^\"]+ "\")" { return ["victim_position", v]; }

SuicideEvent
  = player:Player " committed suicide with \"" weapon:$[^\"]+ "\" (attacker_position \"" attackerPos:$[^\"]+ "\")"
    {
      return {
        type: "suicide",
        player,
        weapon,
        attackerPosition: attackerPos
      };
    }

// m_filter variants must come before normal SpawnedEvent
SpawnedMFilterEvent
  = player:Player " spawned with m_filter on"
    { return { type: "spawnedMFilter", player }; }

SpawnedAsMFilterEvent
  = player:Player " spawned as " role:$[^ ]+ " with m_filter on"
    { return { type: "spawnedMFilter", player, role: role.toLowerCase() }; }

ChargedAsMFilterEvent
  = player:Player " charged as " "\""? role:$[^\"\n ]+ "\""? " with m_filter on"
    { return { type: "chargedMFilter", player, role: role.toLowerCase() }; }

SpawnedEvent
  = player:Player " spawned as \"" role:$[^\"]+ "\""
    { return { type: "spawned", player, role }; }

ChangedRoleEvent
  = player:Player " changed role to \"" role:$[^\"]+ "\""
    { return { type: "changedRole", player, role }; }

ChangedNameEvent
  = player:Player " changed name to \"" newName:$[^\"]* "\""
    { return { type: "changedName", player, newName }; }

PickedUpItemEvent
  = player:Player " picked up item \"" item:$[^\"]+ "\"" healing:PickedUpHealing?
    {
      const result = { type: "pickedUpItem", player, item };
      if (healing !== null) result.healing = healing;
      return result;
    }

PickedUpHealing
  = " (healing \"" v:$[0-9]+ "\")" { return parseInt(v, 10); }

SayTeamEvent
  = player:Player " say_team \"" message:$[^\"]* "\""
    { return { type: "sayTeam", player, message }; }

SayEvent
  = player:Player " say \"" message:$[^\"]* "\""
    { return { type: "say", player, message }; }

PositionReportEvent
  = player:Player " position_report (position \"" position:$[^\"]+ "\")"
    { return { type: "positionReport", player, position }; }

JoinedTeamEvent
  = player:Player " joined team \"" team:$[^\"]+ "\""
    { return { type: "joinedTeam", player, newTeam: team }; }

ConnectedEvent
  = player:Player " connected, address \"" address:$[^\"]+ "\""
    { return { type: "connected", player, address }; }

EnteredGameEvent
  = player:Player " entered the game"
    { return { type: "enteredGame", player }; }

// ─── Team / World events ──────────────────────────────────

PointCapturedEvent
  = "Team \"" team:$[^\"]+ "\" triggered \"pointcaptured\" (cp \"" cp:$[0-9]+ "\") (cpname \"" cpname:$[^\"]+ "\") (numcappers \"" numcappers:$[0-9]+ "\")" cappers:CapperList _?
    {
      return {
        type: "pointCaptured",
        team,
        cp: parseInt(cp, 10),
        cpname,
        numcappers: parseInt(numcappers, 10),
        players: cappers
      };
    }

CapperList
  = cappers:Capper* { return cappers; }

Capper
  = " (player" [0-9]+ " \"" player:$[^\"]+ "\") (position" [0-9]+ " \"" position:$[^\"]+ "\")"
    { return { player, position }; }

IntermissionWinLimitEvent
  = "Team \"" team:$[^\"]+ "\" triggered \"Intermission_Win_Limit\""
    { return { type: "intermissionWinLimit", team }; }

RoundStartEvent
  = "World triggered \"Round_Start\""
    { return { type: "roundStart" }; }

RoundSetupBeginEvent
  = "World triggered \"Round_Setup_Begin\""
    { return { type: "roundSetupBegin" }; }

RoundSetupEndEvent
  = "World triggered \"Round_Setup_End\""
    { return { type: "roundSetupEnd" }; }

RoundWinEvent
  = "World triggered \"Round_Win\" (winner \"" winner:$[^\"]+ "\")"
    { return { type: "roundWin", winner }; }

RoundLengthEvent
  = "World triggered \"Round_Length\" (seconds \"" seconds:$[0-9.]+ "\")"
    { return { type: "roundLength", seconds: parseFloat(seconds) }; }

RoundOvertimeEvent
  = "World triggered \"Round_Overtime\""
    { return { type: "roundOvertime" }; }

GameOverEvent
  = "World triggered \"Game_Over\" reason \"" reason:$[^\"]+ "\""
    { return { type: "gameOver", reason }; }

GamePausedEvent
  = "World triggered \"Game_Paused\""
    { return { type: "gamePaused" }; }

GameUnpausedEvent
  = "World triggered \"Game_Unpaused\""
    { return { type: "gameUnpaused" }; }

PauseLengthEvent
  = "World triggered \"Pause_Length\" (seconds \"" seconds:$[0-9.]+ "\")"
    { return { type: "pauseLength", seconds: parseFloat(seconds) }; }

CurrentScoreEvent
  = "Team \"" team:$[^\"]+ "\" current score \"" score:$[0-9]+ "\" with \"" numPlayers:$[0-9]+ "\" players"
    {
      return {
        type: "currentScore",
        team,
        score: parseInt(score, 10),
        numPlayers: parseInt(numPlayers, 10)
      };
    }

FinalScoreEvent
  = "Team \"" team:$[^\"]+ "\" final score \"" score:$[0-9]+ "\" with \"" numPlayers:$[0-9]+ "\" players"
    {
      return {
        type: "finalScore",
        team,
        score: parseInt(score, 10),
        numPlayers: parseInt(numPlayers, 10)
      };
    }

// ─── System/Plugin events ─────────────────────────────────

DemosTfEvent
  = "[demos.tf]: " message:$(.+)
    { return { type: "demosTf", message }; }

PasstimeBallSpawnedEvent
  = "passtime_ball spawned from the " location:$[^\.]+ "."
    { return { type: "passtimeBallSpawned", location }; }

PasstimeBallDamageEvent
  = "passtime_ball took damage " details:$(.+)
    { return { type: "passtimeBallDamage", details }; }

PanaceaCheckEvent
  = "Panacea check" details:$(.+)
    { return { type: "panaceaCheck", details }; }

PrintingForClientEvent
  = "Printing for client: " client:$[0-9]+
    { return { type: "printingForClient", client: parseInt(client, 10) }; }

// ─── Fallback ─────────────────────────────────────────────

UnknownEvent
  = body:$(.*)
    { return { type: "unknown", body }; }

// ─── Player parsing ───────────────────────────────────────
// Player format: "name<entityId><steamId><team>"
// Names can contain ANY characters including < > " unicode etc.
// We parse from the right: find the last occurrence of <team>"
// by matching the suffix pattern.

Player
  = "\"" chars:PlayerChars "\""
    { return chars; }

// Match everything greedily, then parse the player structure from the captured string.
// The pattern is: name<digits><steamid><team>
// Steam IDs are treated as opaque strings — no format validation.
PlayerChars
  = name:$PlayerNameChars "<" entityId:$[0-9]+ "><" steamId:$[^>]+ "><" team:$[^>]* ">"
    {
      return {
        name,
        entityId: parseInt(entityId, 10),
        steamId,
        team
      };
    }

// Player name: greedily match characters, but stop before the <entityId><steamId><team>" suffix
PlayerNameChars
  = chars:PlayerNameChar+ { return chars.join(""); }

PlayerNameChar
  = !("<" [0-9]+ "><" [^>]+ "><" [^>]* ">\"") .
    { return text(); }

// ─── Whitespace ───────────────────────────────────────────

_ = " "+
