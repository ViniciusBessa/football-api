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
  type: 'number',
  schema: false,
  validate: competitionExists,
});

ajv.addKeyword({
  keyword: 'teamExists',
  async: true,
  type: 'number',
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'matchExists',
  async: true,
  type: 'number',
  schema: false,
  validate: matchExists,
});

async function matchExists(matchId: number): Promise<boolean> {
  const match = await prisma.match.findFirst({
    where: { id: matchId },
  });
  return !!match;
}

// Creation Schema
const createMatchSchema = ajv.compile<CreateMatchInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['competitionId', 'homeTeamId', 'awayTeamId'],
      errorMessage: {
        competitionId: MATCH_MESSAGES.COMPETITION_ID_REQUIRED,
        homeTeamId: MATCH_MESSAGES.HOME_TEAM_ID_REQUIRED,
        awayTeamId: MATCH_MESSAGES.AWAY_TEAM_ID_REQUIRED,
      },
    },
  ],

  properties: {
    competitionId: {
      type: ['string', 'number'],
      competitionExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.COMPETITION_ID_TYPE,
        competitionExists: MATCH_MESSAGES.COMPETITION_NOT_FOUND,
      },
    },

    homeTeamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.HOME_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.HOME_TEAM_NOT_FOUND,
      },
    },

    awayTeamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.AWAY_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.AWAY_TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateMatchSchema = ajv.compile<UpdateMatchInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        id: MATCH_MESSAGES.ID_REQUIRED,
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      matchExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.ID_TYPE,
        matchExists: MATCH_MESSAGES.NOT_FOUND,
      },
    },

    competitionId: {
      type: ['string', 'number'],
      competitionExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.COMPETITION_ID_TYPE,
        competitionExists: MATCH_MESSAGES.COMPETITION_NOT_FOUND,
      },
    },

    homeTeamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.HOME_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.HOME_TEAM_NOT_FOUND,
      },
    },

    awayTeamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.AWAY_TEAM_ID_TYPE,
        teamExists: MATCH_MESSAGES.AWAY_TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
  },
});

// Get Schema
const getMatchSchema = ajv.compile<GetMatchInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        id: MATCH_MESSAGES.ID_REQUIRED,
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      matchExists: true,

      errorMessage: {
        type: MATCH_MESSAGES.ID_TYPE,
        matchExists: MATCH_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
  },
});

export { createMatchSchema, updateMatchSchema, getMatchSchema, matchExists };
