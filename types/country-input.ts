export interface CreateCountryInput {
  name: string;
  code: string;
  flagUrl: string;
}

export interface UpdateCountryInput {
  id: number;
  name?: string;
  code?: string;
  flagUrl?: string;
}

export interface GetCountryInput {
  id: number;
}
