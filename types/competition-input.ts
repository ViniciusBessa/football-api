import { CompetitionType } from '@prisma/client';

export interface CreateCompetitionInput {
  name: string;
  code: string;
  logoUrl: string;
  type: CompetitionType;
}

export interface UpdateCompetitionInput {
  name?: string;
  code?: string;
  logo_url?: string;
  type?: CompetitionType;
}

export interface DeleteCompetitionInput {
  id: number;
}
