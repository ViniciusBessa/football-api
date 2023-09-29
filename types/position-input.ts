export interface CreatePositionInput {
  name: string;
}

export interface UpdatePositionInput {
  id: number;
  name?: string;
}

export interface DeletePositionInput {
  id: number;
}
