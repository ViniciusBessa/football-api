export interface CreateCountryInput {
  name: string;
  code: string;
  flagUrl: string;
}

export interface UpdateCountryInput {
  name?: string;
  code?: string;
  flagUrl?: string;
}

export interface DeleteCountryInput {
  id: number;
}
