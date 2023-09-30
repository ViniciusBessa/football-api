export interface CreateTransferInput {
  playerId: number;
  previousTeamId: number;
  newTeamId: number;
  transferFee: number;
  date: Date;
}

export interface UpdateTransferInput {
  id: number;
  playerId?: number;
  previousTeamId?: number;
  newTeamId?: number;
  transferFee?: number;
  date?: Date;
}

export interface GetTransferInput {
  id: number;
}
