import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreatePlayerInput,
  DeletePlayerInput,
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

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'nameIsAvailable',
  async: true,
  type: 'string',
  schema: false,
  validate: nameIsAvailable,
});

ajv.addKeyword({
  keyword: 'positionExists',
  async: true,
  type: 'number',
  schema: false,
  validate: positionExists,
});

ajv.addKeyword({
  keyword: 'countryExists',
  async: true,
  type: 'number',
  schema: false,
  validate: countryExists,
});

ajv.addKeyword({
  keyword: 'teamExists',
  async: true,
  type: 'number',
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'playerExists',
  async: true,
  type: 'number',
  schema: false,
  validate: playerExists,
});

async function nameIsAvailable(name: string): Promise<boolean> {
  const players = await prisma.player.findMany({
    where: { name },
  });
  return players.length === 0;
}

async function playerExists(playerId: number): Promise<boolean> {
  const player = await prisma.player.findFirst({
    where: { id: playerId },
  });
  return !!player;
}

// Creation Schema
const createPlayerSchema = ajv.compile<CreatePlayerInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: [
        'name',
        'dateOfBirth',
        'height',
        'weight',
        'positionId',
        'countryId',
        'currentTeamId',
      ],

      errorMessage: {
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
    },
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
      type: 'date',

      errorMessage: {
        type: PLAYER_MESSAGES.DATE_OF_BIRTH_TYPE,
      },
    },

    height: {
      type: 'number',
      min: HEIGHT_MIN,
      max: HEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.HEIGHT_TYPE,
        min: PLAYER_MESSAGES.HEIGHT_MIN,
        max: PLAYER_MESSAGES.HEIGHT_MAX,
      },
    },

    weight: {
      type: 'number',
      min: WEIGHT_MIN,
      max: WEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.WEIGHT_TYPE,
        min: PLAYER_MESSAGES.WEIGHT_MIN,
        max: PLAYER_MESSAGES.WEIGHT_MAX,
      },
    },

    positionId: {
      type: ['string', 'number'],
      positionExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.POSITION_ID_TYPE,
        positionExists: PLAYER_MESSAGES.POSITION_NOT_FOUND,
      },
    },

    countryId: {
      type: ['string', 'number'],
      countryExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: PLAYER_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },

    teamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.CURRENT_TEAM_ID_TYPE,
        teamExists: PLAYER_MESSAGES.CURRENT_TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updatePlayerSchema = ajv.compile<UpdatePlayerInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: PLAYER_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      playerExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.ID_TYPE,
        countryExists: PLAYER_MESSAGES.NOT_FOUND,
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
      type: 'date',

      errorMessage: {
        type: PLAYER_MESSAGES.DATE_OF_BIRTH_TYPE,
      },
    },

    height: {
      type: 'number',
      min: HEIGHT_MIN,
      max: HEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.HEIGHT_TYPE,
        min: PLAYER_MESSAGES.HEIGHT_MIN,
        max: PLAYER_MESSAGES.HEIGHT_MAX,
      },
    },

    weight: {
      type: 'number',
      min: WEIGHT_MIN,
      max: WEIGHT_MAX,

      errorMessage: {
        type: PLAYER_MESSAGES.WEIGHT_TYPE,
        min: PLAYER_MESSAGES.WEIGHT_MIN,
        max: PLAYER_MESSAGES.WEIGHT_MAX,
      },
    },

    positionId: {
      type: ['string', 'number'],
      positionExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.POSITION_ID_TYPE,
        positionExists: PLAYER_MESSAGES.POSITION_NOT_FOUND,
      },
    },

    countryId: {
      type: ['string', 'number'],
      countryExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: PLAYER_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },

    teamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.CURRENT_TEAM_ID_TYPE,
        teamExists: PLAYER_MESSAGES.CURRENT_TEAM_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deletePlayerSchema = ajv.compile<DeletePlayerInput>({
  type: 'object',
  $async: true,

  allof: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: PLAYER_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      playerExists: true,

      errorMessage: {
        type: PLAYER_MESSAGES.ID_TYPE,
        playerExists: PLAYER_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
  },
});

export {
  createPlayerSchema,
  updatePlayerSchema,
  deletePlayerSchema,
  playerExists,
};
