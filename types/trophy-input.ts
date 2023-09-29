export interface CreateTrophyInput {
  competitionId: number;
  seasonId: number;
  teamId: number;
}

export interface UpdateTrophyInput {
  competitionId?: number;
  seasonId?: number;
  teamId?: number;
}

export interface DeleteTrophyInput {
  id: number;
}
