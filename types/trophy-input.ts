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

export interface DeleteTrophyInput {
  id: number;
}
