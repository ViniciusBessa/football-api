export interface CreateMatchInput {
  homeTeamId: number;
  awayTeamId: number;
  competitionId: number;
  seasonId: number;
}

export interface UpdateMatchInput {
  homeTeamId?: number;
  awayTeamId?: number;
  competitionId?: number;
  seasonId?: number;
}

export interface DeleteMatchInput {
  id: number;
}
