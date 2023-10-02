import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateMatchGoalInput,
  GetMatchGoalInput,
  UpdateMatchGoalInput,
} from '../../types/match-goal-input';
import { matchExists } from './matches-validations';
import { teamExists } from './teams-validations';
import { playerExists } from './players-validations';

// Error messages
const MATCH_GOAL_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  MATCH_ID_TYPE: "The type of the match's id must be string or number",
  MATCH_ID_REQUIRED: 'Please, provide the id of the match',
  MATCH_NOT_FOUND: 'No match was found with the provided id',
  TEAM_ID_TYPE: "The type of the team's id must be string or number",
  TEAM_ID_REQUIRED: 'Please, provide the id of the team',
  TEAM_NOT_FOUND: 'No team was found with the provided id',
  GOALSCORER_ID_TYPE:
    "The type of the goalscorer's id must be string or number",
  GOALSCORER_ID_REQUIRED: 'Please, provide the id of the goalscorer',
  GOALSCORER_NOT_FOUND:
    'No player was found with the id provided for the goalscorer',
  ASSISTANT_ID_TYPE: "The type of the assistant's id must be string or number",
  ASSISTANT_NOT_FOUND:
    'No player was found with the id provided for the assistant',
  OWN_GOAL_TYPE: "The type of the property 'is own goal' must be a boolean",
  OWN_GOAL_REQUIRED: 'Please, specify if it was a own goal',
  GOAL_TIMESTAMP_TYPE: "The goal's timestamp must be a time",
  GOAL_TIMESTAMP_REQUIRED: "Please, provide the goal's timestamp",
  ID_TYPE: "The type of the goal's id must be string or number",
  ID_REQUIRED: 'Please, provide the id of the goal',
  NOT_FOUND: 'No goal was found with the id provided',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'matchExists',
  async: true,
  schema: false,
  validate: matchExists,
});

ajv.addKeyword({
  keyword: 'teamExists',
  async: true,
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'playerExists',
  async: true,
  schema: false,
  validate: playerExists,
});

ajv.addKeyword({
  keyword: 'matchGoalExists',
  async: true,
  schema: false,
  validate: matchGoalExists,
});

async function matchGoalExists(matchGoalId: string | number): Promise<boolean> {
  const matchGoal = await prisma.matchGoals.findFirst({
    where: { id: Number(matchGoalId) },
  });
  return !!matchGoal;
}

// Creation Schema
const createMatchGoalSchema = ajv.compile<CreateMatchGoalInput>({
  type: 'object',
  $async: true,
  required: ['matchId', 'teamId', 'goalscorerId', 'isOwnGoal', 'goalTimestamp'],

  properties: {
    matchId: {
      type: 'number',
      matchExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.MATCH_ID_TYPE,
        matchExists: MATCH_GOAL_MESSAGES.MATCH_NOT_FOUND,
      },
    },

    teamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.TEAM_ID_TYPE,
        teamExists: MATCH_GOAL_MESSAGES.TEAM_NOT_FOUND,
      },
    },

    goalScorerId: {
      type: 'number',
      playerExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.GOALSCORER_ID_TYPE,
        playerExists: MATCH_GOAL_MESSAGES.GOALSCORER_NOT_FOUND,
      },
    },

    assistantId: {
      type: 'number',
      playerExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.GOALSCORER_ID_TYPE,
        playerExists: MATCH_GOAL_MESSAGES.GOALSCORER_NOT_FOUND,
      },
    },

    isOwnGoal: {
      type: 'boolean',

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.OWN_GOAL_TYPE,
      },
    },

    goalTimestamp: {
      type: 'object',

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.GOAL_TIMESTAMP_TYPE,
      },
    },
  },

  errorMessage: {
    type: MATCH_GOAL_MESSAGES.OBJECT_TYPE,
    required: {
      matchId: MATCH_GOAL_MESSAGES.MATCH_ID_REQUIRED,
      teamId: MATCH_GOAL_MESSAGES.TEAM_ID_REQUIRED,
      goalscorerId: MATCH_GOAL_MESSAGES.GOALSCORER_ID_REQUIRED,
      isOwnGoal: MATCH_GOAL_MESSAGES.OWN_GOAL_REQUIRED,
      goalTimestamp: MATCH_GOAL_MESSAGES.GOAL_TIMESTAMP_REQUIRED,
    },
  },
});

// Update Schema
const updateMatchGoalSchema = ajv.compile<UpdateMatchGoalInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      matchGoalExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.ID_TYPE,
        matchGoalExists: MATCH_GOAL_MESSAGES.NOT_FOUND,
      },
    },

    matchId: {
      type: 'number',
      matchExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.MATCH_ID_TYPE,
        matchExists: MATCH_GOAL_MESSAGES.MATCH_NOT_FOUND,
      },
    },

    teamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.TEAM_ID_TYPE,
        teamExists: MATCH_GOAL_MESSAGES.TEAM_NOT_FOUND,
      },
    },

    goalScorerId: {
      type: 'number',
      playerExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.GOALSCORER_ID_TYPE,
        playerExists: MATCH_GOAL_MESSAGES.GOALSCORER_NOT_FOUND,
      },
    },

    assistantId: {
      type: 'number',
      playerExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.GOALSCORER_ID_TYPE,
        playerExists: MATCH_GOAL_MESSAGES.GOALSCORER_NOT_FOUND,
      },
    },

    isOwnGoal: {
      type: 'boolean',

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.OWN_GOAL_TYPE,
      },
    },

    goalTimestamp: {
      type: 'object',

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.GOAL_TIMESTAMP_TYPE,
      },
    },
  },

  errorMessage: {
    type: MATCH_GOAL_MESSAGES.OBJECT_TYPE,
    required: {
      id: MATCH_GOAL_MESSAGES.ID_REQUIRED,
    },
  },
});

// Get Schema
const getMatchGoalSchema = ajv.compile<GetMatchGoalInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      matchGoalExists: true,

      errorMessage: {
        type: MATCH_GOAL_MESSAGES.ID_TYPE,
        matchGoalExists: MATCH_GOAL_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: MATCH_GOAL_MESSAGES.OBJECT_TYPE,
    required: {
      id: MATCH_GOAL_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createMatchGoalSchema,
  updateMatchGoalSchema,
  getMatchGoalSchema,
  MATCH_GOAL_MESSAGES,
};
