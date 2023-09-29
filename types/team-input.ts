export interface CreateTeamInput {
  name: string;
  code: string;
  foundingYear: Date;
  logoUrl: string;
  isNational?: boolean;
  countryId: number;
}

export interface UpdateTeamInput {
  name?: string;
  code?: string;
  foundingYear?: Date;
  logoUrl?: string;
  isNational?: boolean;
  countryId?: number;
}

export interface DeleteTeamInput {
  id: number;
}
