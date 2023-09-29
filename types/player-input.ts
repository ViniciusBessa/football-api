export interface CreatePlayerInput {
  name: string;
  dateOfBirth: Date;
  height: number;
  weight: number;
  positionId: number;
  countryId: number;
  teamId: number;
}

export interface UpdatePlayerInput {
  name?: string;
  dateOfBirth?: Date;
  height?: number;
  weight?: number;
  positionId?: number;
  countryId?: number;
  teamId?: number;
}

export interface DeletePlayerInput {
  id: number;
}
