{
  function int(s) { return parseInt(s, 10); }
  function float(s) { return parseFloat(s); }
  function kvs(pairs) {
    const o = {};
    for (const [k, v] of pairs) o[k] = v;
    return o;
  }
}

Line
  = timestamp:Timestamp " " event:Event
    { return { timestamp, raw: input, ...event }; }

Timestamp
  = "L "
    month:$([0-9][0-9]) "/"
    day:$([0-9][0-9]) "/"
    year:$([0-9][0-9][0-9][0-9])
    " - "
    hour:$([0-9][0-9]) ":"
    min:$([0-9][0-9]) ":"
    sec:$([0-9][0-9]) ":"
    {
      return new Date(
        int(year),
        int(month) - 1,
        int(day),
        int(hour),
        int(min),
        int(sec)
      ).getTime();
    }

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
  / DomRevEvent
  / CaptureBlockedEvent
  / ObjectActionEvent
  / KilledObjectEvent
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
  / DisconnectedEvent
  / SteamUserIdValidatedEvent
  / ServerPluginMessageEvent
  / WorldMetaDataEvent
  / SimpleWorldEvent
  / RoundWinEvent
  / RoundLengthEvent
  / GameOverEvent
  / PauseLengthEvent
  / ScoreEvent
  / PasstimeBallSpawnedEvent
  / PasstimeBallDamageEvent
  / PanaceaCheckEvent
  / PrintingForClientEvent
  / MetaEvent
  / UnknownEvent

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
      if (kvs.airshot !== undefined) result.airshot = true;
      if (kvs.height !== undefined) result.height = int(kvs.height);
      if (kvs.healing !== undefined) result.healing = int(kvs.healing);
      return result;
    }

MedicDeathEvent
  = player:Player
    " triggered \"medic_death\" against "
    victim:Player
    kvs:KVs
    {
      return {
        type: "medicDeath",
        player,
        victim,
        healing: int(kvs.healing),
        ubercharge: int(kvs.ubercharge)
      };
    }

HealedEvent
  = player:Player
    " triggered \"healed\" against "
    target:Player
    kvs:KVs
    {
      const result = {
        type: "healed",
        player,
        target,
        healing: int(kvs.healing)
      };
      if (kvs.airshot) result.airshot = true;
      if (kvs.height !== undefined) result.height = int(kvs.height);
      return result;
    }

ShotFiredEvent
  = player:Player
    " triggered \"shot_fired\""
    kvs:KVs
    { return { type: "shotFired", player, weapon: kvs.weapon }; }

ShotHitEvent
  = player:Player
    " triggered \"shot_hit\""
    kvs:KVs
    { return { type: "shotHit", player, weapon: kvs.weapon }; }

EmptyUberEvent
  = player:Player
    " triggered \"empty_uber\""
    { return { type: "emptyUber", player }; }

ChargeReadyEvent
  = player:Player
    " triggered \"chargeready\""
    { return { type: "chargeReady", player }; }

ChargeDeployedEvent
  = player:Player
    " triggered \"chargedeployed\""
    kvs:KVs
    { return { type: "chargeDeployed", player, medigun: kvs.medigun }; }

ChargeEndedEvent
  = player:Player
    " triggered \"chargeended\""
    kvs:KVs
    { return { type: "chargeEnded", player, duration: float(kvs.duration) }; }

FirstHealAfterSpawnEvent
  = player:Player
    " triggered \"first_heal_after_spawn\""
    kvs:KVs
    { return { type: "firstHealAfterSpawn", player, time: float(kvs.time) }; }

KillAssistEvent
  = player:Player
    " triggered \"kill assist\" against "
    victim:Player
    kvs:KVs
    {
      return {
        type: "killAssist",
        player,
        victim,
        assisterPosition: kvs.assister_position,
        attackerPosition: kvs.attacker_position,
        victimPosition: kvs.victim_position
      };
    }

DomRevEvent
  = player:Player
    " triggered \""
    trigger:$("domination" / "revenge")
    "\" against "
    victim:Player
    kvs:KVs?
    {
      const result = { type: trigger, player, victim };
      if (kvs?.assist) result.assist = true;
      return result;
    }

CaptureBlockedEvent
  = player:Player
    " triggered \"captureblocked\""
    kvs:KVs
    {
      return {
        type: "captureBlocked",
        player,
        cp: int(kvs.cp),
        cpname: kvs.cpname,
        position: kvs.position
      };
    }

ObjectActionEvent
  = player:Player
    " triggered \""
    trigger:$(
      "player_builtobject"
      / "object_detonated"
      / "player_carryobject"
      / "player_dropobject"
    )
    "\""
    kvs:KVs
    {
      const types = {
        player_builtobject: "playerBuiltObject",
        object_detonated: "objectDetonated",
        player_carryobject: "playerCarryObject",
        player_dropobject: "playerDropObject"
      };
      return {
        type: types[trigger],
        player,
        object: kvs.object,
        position: kvs.position
      };
    }

KilledObjectEvent
  = player:Player
    " triggered \"killedobject\" "
    kvs:KVs
    {
      const result = {
        type: "killedObject",
        player,
        object: kvs.object,
        weapon: kvs.weapon,
        objectowner: kvs.objectowner,
        attackerPosition: kvs.attacker_position
      };
      if (kvs.assist) result.assist = true;
      if (kvs.assister_position) {
        result.assisterPosition = kvs.assister_position;
      }
      return result;
    }

PlayerExtinguishedEvent
  = player:Player
    " triggered \"player_extinguished\" against "
    victim:Player
    " with \""
    weapon:$[^\"]+
    "\""
    kvs:KVs
    {
      return {
        type: "playerExtinguished",
        player,
        victim,
        weapon,
        attackerPosition: kvs.attacker_position,
        victimPosition: kvs.victim_position
      };
    }

LostUberAdvantageEvent
  = player:Player
    " triggered \"lost_uber_advantage\""
    kvs:KVs
    { return { type: "lostUberAdvantage", player, time: int(kvs.time) }; }

MatchPauseEvent
  = player:Player
    " triggered \"matchpause\""
    { return { type: "matchPause", player }; }

MatchUnpauseEvent
  = player:Player
    " triggered \"matchunpause\""
    { return { type: "matchUnpause", player }; }

PassGetEvent
  = player:Player
    " triggered \"pass_get\""
    kvs:KVs
    {
      return {
        type: "passGet",
        player,
        firstcontact: int(kvs.firstcontact) === 1,
        position: kvs.position
      };
    }

PassFreeEvent
  = player:Player
    " triggered \"pass_free\""
    kvs:KVs
    { return { type: "passFree", player, position: kvs.position }; }

PassPassCaughtEvent
  = player:Player
    " triggered \"pass_pass_caught\" against "
    target:Player
    " "
    kvs:KVs
    {
      return {
        type: "passPassCaught",
        player,
        target,
        interception: int(kvs.interception) === 1,
        save: int(kvs.save) === 1,
        handoff: int(kvs.handoff) === 1,
        dist: float(kvs.dist),
        duration: float(kvs.duration),
        throwerPosition: kvs.thrower_position,
        catcherPosition: kvs.catcher_position
      };
    }

PassScoreEvent
  = player:Player
    " triggered \"pass_score\" "
    kvs:KVs
    {
      return {
        type: "passScore",
        player,
        points: int(kvs.points),
        panacea: int(kvs.panacea) === 1,
        winStrat: int(kvs["win strat"]) === 1,
        deathbomb: int(kvs.deathbomb) === 1,
        dist: int(kvs.dist),
        position: kvs.position
      };
    }

PassScoreAssistEvent
  = player:Player
    " triggered \"pass_score_assist\""
    kvs:KVs
    { return { type: "passScoreAssist", player, position: kvs.position }; }

PassBallStolenEvent
  = player:Player
    " triggered \"pass_ball_stolen\" against "
    victim:Player
    kvs:KVs
    {
      return {
        type: "passBallStolen",
        player,
        victim,
        stealDefense: int(kvs["steal defense"]) === 1,
        thiefPosition: kvs.thief_position,
        victimPosition: kvs.victim_position
      };
    }

CatapultEvent
  = player:Player
    " triggered \""
    catapult:$[a-z_0-9]+
    "\" with the jack"
    kvs:KVs
    { return { type: "catapult", player, catapult, position: kvs.position }; }

MedicDeathExEvent
  = player:Player
    " triggered \"medic_death_ex\""
    kvs:KVs
    { return { type: "medicDeathEx", player, uberpct: int(kvs.uberpct) }; }

KillEvent
  = player:Player
    " killed "
    victim:Player
    " with \""
    weapon:$[^\"]+
    "\""
    kvs:KVs
    {
      const result = {
        type: "kill",
        player,
        victim,
        weapon,
        attackerPosition: kvs.attacker_position,
        victimPosition: kvs.victim_position
      };
      if (kvs.customkill !== undefined) {
        result.customkill = kvs.customkill;
      }
      return result;
    }

SuicideEvent
  = player:Player
    " committed suicide with \""
    weapon:$[^\"]+
    "\""
    kvs:KVs
    {
      return {
        type: "suicide",
        player,
        weapon,
        attackerPosition: kvs.attacker_position
      };
    }

SpawnedMFilterEvent
  = player:Player
    " spawned with m_filter on"
    { return { type: "spawnedMFilter", player }; }

SpawnedAsMFilterEvent
  = player:Player
    " spawned as "
    role:$[^ ]+
    " with m_filter on"
    { return { type: "spawnedMFilter", player, role: role.toLowerCase() }; }

ChargedAsMFilterEvent
  = player:Player
    " charged as "
    "\""? role:$[^\"\n ]+ "\""?
    " with m_filter on"
    { return { type: "chargedMFilter", player, role: role.toLowerCase() }; }

SpawnedEvent
  = player:Player
    " spawned as \""
    role:$[^\"]+
    "\""
    { return { type: "spawned", player, role }; }

ChangedRoleEvent
  = player:Player
    " changed role to \""
    role:$[^\"]+
    "\""
    { return { type: "changedRole", player, role }; }

ChangedNameEvent
  = player:Player
    " changed name to \""
    newName:$[^\"]*
    "\""
    { return { type: "changedName", player, newName }; }

PickedUpItemEvent
  = player:Player
    " picked up item \""
    item:$[^\"]+ "\""
    kvs:KVs?
    {
      const result = { type: "pickedUpItem", player, item };
      if (kvs?.healing !== undefined) {
        result.healing = int(kvs.healing);
      }
      return result;
    }

SayTeamEvent
  = player:Player
    " say_team \""
    message:$[^\"]*
    "\""
    { return { type: "sayTeam", player, message }; }

SayEvent
  = player:Player
    " say \""
    message:$[^\"]*
    "\""
    { return { type: "say", player, message }; }

PositionReportEvent
  = player:Player
    " position_report"
    kvs:KVs
    { return { type: "positionReport", player, position: kvs.position }; }

JoinedTeamEvent
  = player:Player
    " joined team \""
    team:$[^\"]+
    "\""
    { return { type: "joinedTeam", player, newTeam: team }; }

ConnectedEvent
  = player:Player
    " connected, address \""
    address:$[^\"]+
    "\""
    { return { type: "connected", player, address }; }

EnteredGameEvent
  = player:Player
    " entered the game"
    { return { type: "enteredGame", player }; }

PointCapturedEvent
  = "Team \""
    team:$[^\"]+
    "\" triggered \"pointcaptured\" (cp \""
    cp:$[0-9]+
    "\") (cpname \""
    cpname:$[^\"]+
    "\") (numcappers \""
    numcappers:$[0-9]+
    "\")"
    cappers:Capper*
    _?
    {
      return {
        type: "pointCaptured",
        team,
        cp: int(cp),
        cpname,
        numcappers: int(numcappers),
        players: cappers
      };
    }

Capper
  = " (player"
    [0-9]+
    " \""
    player:$[^\"]+
    "\") (position"
    [0-9]+
    " \""
    position:$[^\"]+
    "\")"
    { return { player, position }; }

IntermissionWinLimitEvent
  = "Team \""
    team:$[^\"]+
    "\" triggered \"Intermission_Win_Limit\""
    { return { type: "intermissionWinLimit", team }; }

DisconnectedEvent
  = player:Player
    " disconnected (reason \""
    reason:$[^\"]*
    "\")"
    { return { type: "disconnected", player, reason }; }

SteamUserIdValidatedEvent
  = player:Player
    " STEAM USERID validated"
    { return { type: "steamUserIdValidated", player }; }

ServerPluginMessageEvent
  = "["
    plugin:$[^\]]+
    "]"
    ":"?
    " "
    message:$(.+)
    { return { type: "serverPluginMessage", plugin, message }; }

WorldMetaDataEvent
  = "World triggered \"meta_data\" ("
    key:$[a-z_]+
    " \""
    value:$[^\"]*
    "\")"
    { return { type: "worldMetaData", key, value }; }

SimpleWorldEvent
  = "World triggered \""
    name:$(
      "Round_Start"
      / "Round_Setup_Begin"
      / "Round_Setup_End"
      / "Round_Overtime"
      / "Round_Stalemate"
      / "Game_Paused"
      / "Game_Unpaused"
    )
    "\""
    {
      return {
        type: name.replace(/_/g, "").replace(/^./, c => c.toLowerCase())
      };
    }

RoundWinEvent
  = "World triggered \"Round_Win\""
    kvs:KVs
    { return { type: "roundWin", winner: kvs.winner }; }

RoundLengthEvent
  = "World triggered \"Round_Length\""
    kvs:KVs
    { return { type: "roundLength", seconds: float(kvs.seconds) }; }

GameOverEvent
  = "World triggered \"Game_Over\" reason \""
    reason:$[^\"]+
    "\""
    { return { type: "gameOver", reason }; }

PauseLengthEvent
  = "World triggered \"Pause_Length\""
    kvs:KVs
    { return { type: "pauseLength", seconds: float(kvs.seconds) }; }

ScoreEvent
  = "Team \""
    team:$[^\"]+
    "\" "
    kind:$("current" / "final")
    " score \""
    score:$[0-9]+
    "\" with \""
    numPlayers:$[0-9]+
    "\" players"
    {
      return {
        type: kind + "Score",
        team,
        score: int(score),
        numPlayers: int(numPlayers)
      };
    }


PasstimeBallSpawnedEvent
  = "passtime_ball spawned from the "
    location:$[^\.]+ "."
    { return { type: "passtimeBallSpawned", location }; }

PasstimeBallDamageEvent
  = "passtime_ball took damage "
    details:$(.+)
    { return { type: "passtimeBallDamage", details }; }

PanaceaCheckEvent
  = "Panacea check"
    details:$(.+)
    { return { type: "panaceaCheck", details }; }

PrintingForClientEvent
  = "Printing for client: "
    client:$[0-9]+
    { return { type: "printingForClient", client: int(client) }; }

MetaEvent
  = "# "
    label:$[A-Z0-9_]+
    kvs:KVs?
    { return { type: "meta", label, kvs: kvs || {} }; }

UnknownEvent
  = body:$(.*)
    { return { type: "unknown", body }; }

KVs
  = pairs:KV+
    { return kvs(pairs); }

KV
  = _?
    "("
    key:$[^"]+
    "\""
    value:$[^"]*
    "\")"
    { return [key.trimEnd(), value]; }

Player
  = "\"" @PlayerChars "\""

PlayerChars
  = name:$PlayerNameChars
    "<" entityId:$[0-9]+ ">"
    "<" steamId:$[^>]+ ">"
    "<" team:$[^>]* ">"
    { return { name, entityId: int(entityId), steamId, team }; }

PlayerNameChars
  = chars:PlayerNameChar+
    { return chars.join(""); }

PlayerNameChar
  = !("<" [0-9]+ "><" [^>]+ "><" [^>]* ">\"") .
    { return text(); }

_
  = " "+