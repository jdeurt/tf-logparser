export interface TeamColorPeriod {
  color: "Red" | "Blue";
  start: number;
}

export interface TeamInfo {
  playerSteamIds: string[];
  colors: TeamColorPeriod[];
}
