import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import {
  CreatePlayerInput,
  GetPlayerInput,
  UpdatePlayerInput,
} from '../../types/player-input';
import { countryExists } from './countries-validations';
import { teamExists } from './teams-validations';
import { positionExists } from './positions-validations';

// Field constraints
const NAME_MIN_LENGTH = 4;
const NAME_MAX_LENGTH = 80;
const HEIGHT_MIN = 1.5;
const HEIGHT_MAX = 2.4;
const WEIGHT_MIN = 40;
const WEIGHT_MAX = 140;
const DATE_OF_BIRTH_MIN = new Date('1800-01-01');

// Error messages
const PLAYER_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  NAME_TYPE: "The player's name must be a string",
  NAME_MIN_LENGTH: `The player's name must be at least ${NAME_MIN_LENGTH} characters long`,
  NAME_MAX_LENGTH: `The maximum number of characters for the player's name is ${NAME_MAX_LENGTH}`,
  NAME_REQUIRED: 'Please, provide a name for the player',
  NAME_IN_USE: "The player's name provided is already in use",
  HEIGHT_TYPE: "The player's height must be a number",
  HEIGHT_MIN: `The player's height must be at least ${HEIGHT_MIN}`,
  HEIGHT_MAX: `The maximum value for the player's height is ${HEIGHT_MAX}`,
  HEIGHT_REQUIRED: "Please, provide the player's height",
  WEIGHT_TYPE: "The player's weight must be a number",
  WEIGHT_MIN: `The player's weight must be at least ${WEIGHT_MIN}`,
  WEIGHT_MAX: `The maximum value for the player's weight is ${WEIGHT_MAX}`,
  WEIGHT_REQUIRED: "Please, provide the player's weight",
  DATE_OF_BIRTH_TYPE: "The player's date of birth must be a date",
  DATE_OF_BIRTH_MIN: `The date of birth must be at least from the year ${DATE_OF_BIRTH_MIN.getFullYear()}`,
  DATE_OF_BIRTH_FORMAT: 'The date of birth must be formatted as a date',
  DATE_OF_BIRTH_REQUIRED: "Please, provide the player's date of birth",
  POSITION_ID_TYPE: "The position's id must be a number or a string",
  POSITION_ID_REQUIRED: "Please, provide the id of the player's position",
  POSITION_NOT_FOUND: 'No position was found with the id provided',
  COUNTRY_ID_TYPE: "The country's id must be a number or a string",
  COUNTRY_ID_REQUIRED: "Please, provide the id of the player's country",
  COUNTRY_NOT_FOUND: 'No country was found with the id provided',
  CURRENT_TEAM_ID_TYPE: "The team's id must be a number or a string",
  CURRENT_TEAM_ID_REQUIRED: "Please, provide the id of the player's team",
  CURRENT_TEAM_NOT_FOUND: 'No team was found with the id provided',
  NOT_FOUND: 'No player was found with the provided id',
  ID_TYPE: "The player's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a player',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));
addFormats(ajv);

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'nameIsAvailable',
  async: true,
  schema: false,
  validate: nameIsAvailable,
});

ajv.addKeyword({
  keyword: 'positionExists',
  async: true,
  schema: false,
  validate: positionExists,
});

ajv.addKeyword({
  keyword: 'countryExists',
  async: true,
  schema: false,
  validate: countryExists,
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

async function nameIsAvailable(name: string): Promise<boolean> {
  const players = await prisma.player.findMany({
    where: { name },
  });
  return players.length === 0;
}

async function playerExists(playerId: string | number): Promise<boolean> {
  const player = await prisma.player.findFirst({
    where: { id: Number(playerId) },
  });
  return !!player;
}

// Creation Schema
const createPlayerSchema = ajv.compile<CreatePlayerInput>({
  type: 'object',
  $async: true,
  required: [
    'name',
    'dateOfBirth',
    'height',
    'weight',
    'positionId',
    'countryId',
    'currentTeamId',
  ],

  properties: {
    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: PLAYER_MESSAGES.NAME_TYPE,
        minLength: PLAYER_MESSAGES.NAME_MIN_LENGTH,
        maxLength: PLAYER_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: PLAYER_MESSAGES.NAME_IN_USE,
      },
    },

    dateOfBirth: {
      type: 'string',
      format: 'date-time',
      formatMinimum: DATE_OF_BIRTH_MIN.toISOString(),

      errorMessage: {
        type: PLAYER_MESSAGES.DATE_OF_BIRTH_TYPE,
        format: PLAYER_MESSAGES.DATE_OF_BIRTH_FORMAT,
        formatMinimum: PLAYER_MESSAGES.DATE_OF_BIRTH_MIN,
      },
    },

    height: {
      type: 'number',
      minimum: HEIGHT_MIN,
      maximum: HEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.HEIGHT_TYPE,
        minimum: PLAYER_MESSAGES.HEIGHT_MIN,
        maximum: PLAYER_MESSAGES.HEIGHT_MAX,
      },
    },

    weight: {
      type: 'number',
      minimum: WEIGHT_MIN,
      maximum: WEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.WEIGHT_TYPE,
        minimum: PLAYER_MESSAGES.WEIGHT_MIN,
        maximum: PLAYER_MESSAGES.WEIGHT_MAX,
      },
    },

    positionId: {
      type: 'number',
      positionExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.POSITION_ID_TYPE,
        positionExists: PLAYER_MESSAGES.POSITION_NOT_FOUND,
      },
    },

    countryId: {
      type: 'number',
      countryExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: PLAYER_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },

    currentTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.CURRENT_TEAM_ID_TYPE,
        teamExists: PLAYER_MESSAGES.CURRENT_TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
    required: {
      name: PLAYER_MESSAGES.NAME_REQUIRED,
      dateOfBirth: PLAYER_MESSAGES.DATE_OF_BIRTH_REQUIRED,
      height: PLAYER_MESSAGES.HEIGHT_REQUIRED,
      weight: PLAYER_MESSAGES.WEIGHT_REQUIRED,
      positionId: PLAYER_MESSAGES.POSITION_ID_REQUIRED,
      countryId: PLAYER_MESSAGES.COUNTRY_ID_REQUIRED,
      currentTeamId: PLAYER_MESSAGES.CURRENT_TEAM_ID_REQUIRED,
    },
  },
});

// Update Schema
const updatePlayerSchema = ajv.compile<UpdatePlayerInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      playerExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.ID_TYPE,
        playerExists: PLAYER_MESSAGES.NOT_FOUND,
      },
    },

    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: PLAYER_MESSAGES.NAME_TYPE,
        minLength: PLAYER_MESSAGES.NAME_MIN_LENGTH,
        maxLength: PLAYER_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: PLAYER_MESSAGES.NAME_IN_USE,
      },
    },

    dateOfBirth: {
      type: 'string',
      format: 'date-time',
      formatMinimum: DATE_OF_BIRTH_MIN.toISOString(),

      errorMessage: {
        type: PLAYER_MESSAGES.DATE_OF_BIRTH_TYPE,
        format: PLAYER_MESSAGES.DATE_OF_BIRTH_FORMAT,
        formatMinimum: PLAYER_MESSAGES.DATE_OF_BIRTH_MIN,
      },
    },

    height: {
      type: 'number',
      minimum: HEIGHT_MIN,
      maximum: HEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.HEIGHT_TYPE,
        minimum: PLAYER_MESSAGES.HEIGHT_MIN,
        maximum: PLAYER_MESSAGES.HEIGHT_MAX,
      },
    },

    weight: {
      type: 'number',
      minimum: WEIGHT_MIN,
      maximum: WEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.WEIGHT_TYPE,
        minimum: PLAYER_MESSAGES.WEIGHT_MIN,
        maximum: PLAYER_MESSAGES.WEIGHT_MAX,
      },
    },

    positionId: {
      type: 'number',
      positionExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.POSITION_ID_TYPE,
        positionExists: PLAYER_MESSAGES.POSITION_NOT_FOUND,
      },
    },

    countryId: {
      type: 'number',
      countryExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: PLAYER_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },

    currentTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.CURRENT_TEAM_ID_TYPE,
        teamExists: PLAYER_MESSAGES.CURRENT_TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
    required: {
      id: PLAYER_MESSAGES.ID_REQUIRED,
    },
  },
});

// Get Schema
const getPlayerSchema = ajv.compile<GetPlayerInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      playerExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.ID_TYPE,
        playerExists: PLAYER_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
    required: {
      id: PLAYER_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createPlayerSchema,
  updatePlayerSchema,
  getPlayerSchema,
  playerExists,
  PLAYER_MESSAGES,
};
