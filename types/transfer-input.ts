export interface CreateTransferInput {
  playerId: number;
  previousTeamId: number;
  newTeamId: number;
  transferFee: number;
  date: Date;
}

export interface UpdateTransferInput {
  playerId?: number;
  previousTeamId?: number;
  newTeamId?: number;
  transferFee?: number;
  date?: Date;
}

export interface DeleteTransferInput {
  id: number;
}
