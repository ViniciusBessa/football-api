import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateTrophyInput,
  GetTrophyInput,
  UpdateTrophyInput,
} from '../../types/trophy-input';
import { competitionExists } from './competitions-validations';
import { seasonExists } from './seasons-validations';
import { teamExists } from './teams-validations';

// Error messages
const TROPHY_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  COMPETITION_ID_TYPE: "The competition's id must be a number or a string",
  COMPETITION_ID_REQUIRED: 'Please, provide the id of a competition',
  COMPETITION_NOT_FOUND: 'No competition was found with the id provided',
  SEASON_ID_TYPE: "The season's id must be a number or a string",
  SEASON_ID_REQUIRED: 'Please, provide the id of a season',
  SEASON_NOT_FOUND: 'No season was found with the id provided',
  TEAM_ID_TYPE: "The team's id must be a number or a string",
  TEAM_ID_REQUIRED: 'Please, provide the id of the team',
  TEAM_NOT_FOUND: 'No team was found with the id provided',
  NOT_FOUND: 'No trophy was found with the provided id',
  ID_TYPE: "The trophy's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a trophy',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'competitionExists',
  async: true,
  type: 'number',
  schema: false,
  validate: competitionExists,
});

ajv.addKeyword({
  keyword: 'seasonExists',
  async: true,
  type: 'number',
  schema: false,
  validate: seasonExists,
});

ajv.addKeyword({
  keyword: 'teamExists',
  async: true,
  type: 'number',
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'trophyExists',
  async: true,
  type: 'number',
  schema: false,
  validate: trophyExists,
});

async function trophyExists(trophyId: number): Promise<boolean> {
  const trophy = await prisma.trophy.findFirst({
    where: { id: trophyId },
  });
  return !!trophy;
}

// Creation Schema
const createTrophySchema = ajv.compile<CreateTrophyInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['competitionId', 'seasonId', 'teamId'],
      errorMessage: {
        competitionId: TROPHY_MESSAGES.COMPETITION_ID_REQUIRED,
        seasonId: TROPHY_MESSAGES.SEASON_ID_REQUIRED,
        teamId: TROPHY_MESSAGES.TEAM_ID_REQUIRED,
      },
    },
  ],

  properties: {
    competitionId: {
      type: ['string', 'number'],
      competitionExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.COMPETITION_ID_TYPE,
        competitionExists: TROPHY_MESSAGES.COMPETITION_NOT_FOUND,
      },
    },

    seasonId: {
      type: ['string', 'number'],
      seasonExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.SEASON_ID_TYPE,
        seasonExists: TROPHY_MESSAGES.SEASON_NOT_FOUND,
      },
    },

    teamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.TEAM_ID_TYPE,
        teamExists: TROPHY_MESSAGES.TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TROPHY_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateTrophySchema = ajv.compile<UpdateTrophyInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        id: TROPHY_MESSAGES.ID_REQUIRED,
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      trophyExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.ID_TYPE,
        trophyExists: TROPHY_MESSAGES.NOT_FOUND,
      },
    },

    competitionId: {
      type: ['string', 'number'],
      competitionExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.COMPETITION_ID_TYPE,
        competitionExists: TROPHY_MESSAGES.COMPETITION_NOT_FOUND,
      },
    },

    seasonId: {
      type: ['string', 'number'],
      seasonExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.SEASON_ID_TYPE,
        seasonExists: TROPHY_MESSAGES.SEASON_NOT_FOUND,
      },
    },

    teamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.TEAM_ID_TYPE,
        teamExists: TROPHY_MESSAGES.TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TROPHY_MESSAGES.OBJECT_TYPE,
  },
});

// Get Schema
const getTrophySchema = ajv.compile<GetTrophyInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        id: TROPHY_MESSAGES.ID_REQUIRED,
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      trophyExists: true,

      errorMessage: {
        type: TROPHY_MESSAGES.ID_TYPE,
        trophyExists: TROPHY_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TROPHY_MESSAGES.OBJECT_TYPE,
  },
});

export { createTrophySchema, updateTrophySchema, getTrophySchema };
