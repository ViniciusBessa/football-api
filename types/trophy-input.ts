export interface CreateTrophyInput {
  competitionId: number;
  seasonId: number;
  teamId: number;
}

export interface UpdateTrophyInput {
  id: number;
  competitionId?: number;
  seasonId?: number;
  teamId?: number;
}

export interface GetTrophyInput {
  id: number;
}
