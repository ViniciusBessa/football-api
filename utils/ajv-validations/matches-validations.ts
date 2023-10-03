import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateMatchInput,
  GetMatchInput,
  UpdateMatchInput,
} from '../../types/match-input';
import { competitionExists } from './competitions-validations';
import { teamExists } from './teams-validations';
import { seasonExists } from './seasons-validations';

// Error messages
const MATCH_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  HOME_TEAM_ID_TYPE: "The home team's id must be a number or a string",
  HOME_TEAM_ID_REQUIRED: 'Please, provide the id of the home team',
  HOME_TEAM_NOT_FOUND:
    'No team was found with the id provided to the home team',
  AWAY_TEAM_ID_TYPE: "The away team's id must be a number or a string",
  AWAY_TEAM_ID_REQUIRED: 'Please, provide the id of the away team',
  AWAY_TEAM_NOT_FOUND:
    'No team was found with the id provided to the away team',
  COMPETITION_ID_TYPE: "The competition's id must be a number or a string",
  COMPETITION_ID_REQUIRED: 'Please, provide the id of a competition',
  COMPETITION_NOT_FOUND: 'No competition was found with the id provided',
  SEASON_ID_TYPE: "The season's id must be a number or a string",
  SEASON_ID_REQUIRED: 'Please, provide the id of a season',
  SEASON_NOT_FOUND: 'No season was found with the id provided',
  NOT_FOUND: 'No match was found with the provided id',
  ID_TYPE: "The match's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a match',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'competitionExists',
  async: true,
  schema: false,
  validate: competitionExists,
});

ajv.addKeyword({
  keyword: 'teamExists',
  async: true,
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'seasonExists',
  async: true,
  schema: false,
  validate: seasonExists,
});

ajv.addKeyword({
  keyword: 'matchExists',
  async: true,
  schema: false,
  validate: matchExists,
});

async function matchExists(matchId: string | number): Promise<boolean> {
  const match = await prisma.match.findFirst({
    where: { id: Number(matchId) },
  });
  return !!match;
}

// Creation Schema
const createMatchSchema = ajv.compile<CreateMatchInput>({
  type: 'object',
  $async: true,
  required: ['competitionId', 'homeTeamId', 'awayTeamId', 'seasonId'],

  properties: {
    competitionId: {
      type: 'number',
      competitionExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.COMPETITION_ID_TYPE,
        competitionExists: MATCH_MESSAGES.COMPETITION_NOT_FOUND,
      },
    },

    homeTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.HOME_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.HOME_TEAM_NOT_FOUND,
      },
    },

    awayTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.AWAY_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.AWAY_TEAM_NOT_FOUND,
      },
    },

    seasonId: {
      type: 'number',
      seasonExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.SEASON_ID_TYPE,
        seasonExists: MATCH_MESSAGES.SEASON_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
    required: {
      competitionId: MATCH_MESSAGES.COMPETITION_ID_REQUIRED,
      homeTeamId: MATCH_MESSAGES.HOME_TEAM_ID_REQUIRED,
      awayTeamId: MATCH_MESSAGES.AWAY_TEAM_ID_REQUIRED,
      seasonId: MATCH_MESSAGES.SEASON_ID_REQUIRED,
    },
  },
});

// Update Schema
const updateMatchSchema = ajv.compile<UpdateMatchInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      matchExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.ID_TYPE,
        matchExists: MATCH_MESSAGES.NOT_FOUND,
      },
    },

    competitionId: {
      type: 'number',
      competitionExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.COMPETITION_ID_TYPE,
        competitionExists: MATCH_MESSAGES.COMPETITION_NOT_FOUND,
      },
    },

    homeTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.HOME_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.HOME_TEAM_NOT_FOUND,
      },
    },

    awayTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.AWAY_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.AWAY_TEAM_NOT_FOUND,
      },
    },

    seasonId: {
      type: 'number',
      seasonExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.SEASON_ID_TYPE,
        seasonExists: MATCH_MESSAGES.SEASON_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
    required: {
      id: MATCH_MESSAGES.ID_REQUIRED,
    },
  },
});

// Get Schema
const getMatchSchema = ajv.compile<GetMatchInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      matchExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.ID_TYPE,
        matchExists: MATCH_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
    required: {
      id: MATCH_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createMatchSchema,
  updateMatchSchema,
  getMatchSchema,
  matchExists,
  MATCH_MESSAGES,
};
