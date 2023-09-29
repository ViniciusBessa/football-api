export interface CreateSeasonInput {
  year: number;
  start: Date;
  end: Date;
  isCurrent?: boolean;
}

export interface UpdateSeasonInput {
  year?: number;
  start?: Date;
  end?: Date;
  isCurrent?: boolean;
}

export interface DeleteSeasonInput {
  id: number;
}
