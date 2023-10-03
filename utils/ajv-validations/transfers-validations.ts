import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import {
  CreateTransferInput,
  GetTransferInput,
  UpdateTransferInput,
} from '../../types/transfer-input';
import { playerExists } from './players-validations';
import { teamExists } from './teams-validations';

// Field constraints
const FEE_MIN = 1000;
const FEE_MAX = 9999999999;

// Error messages
const TRANSFER_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  PREVIOUS_TEAM_ID_TYPE:
    "The type of the previous team's id must be string or number",
  PREVIOUS_TEAM_ID_REQUIRED: 'Please, provide the id of the previous team',
  PREVIOUS_TEAM_NOT_FOUND:
    'No team was found with the provided id for the previous team',
  NEW_TEAM_ID_TYPE: "The type of the new team's id must be string or number",
  NEW_TEAM_ID_REQUIRED: 'Please, provide the id of the new team',
  NEW_TEAM_NOT_FOUND: 'No team was found with the provided id for the new team',
  PLAYER_ID_TYPE: "The type of the player's id must be string or number",
  PLAYER_ID_REQUIRED: 'Please, provide the id of the player',
  PLAYER_NOT_FOUND: 'No player was found with the provided id',
  FEE_TYPE: 'The transfer fee must be a number',
  FEE_MIN: `The transfer fee must be at least ${FEE_MIN}`,
  FEE_MAX: `The maximum value for a transfer is ${FEE_MAX}`,
  FEE_REQUIRED: "Please, provide the transfer's fee",
  DATE_TYPE: "The transfer's date must be a string",
  DATE_FORMAT: "The transfer's date must be formatted as a date",
  DATE_REQUIRED: "Please, provide the transfer's date",
  ID_TYPE: "The type of the transfer's id must be string or number",
  ID_REQUIRED: 'Please, provide the id of the transfer',
  NOT_FOUND: 'No transfer was found with the id provided',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));
addFormats(ajv);

// Extra Keywords
const prisma = new PrismaClient();

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
  keyword: 'transferExists',
  async: true,
  schema: false,
  validate: transferExists,
});

async function transferExists(transferId: string | number): Promise<boolean> {
  const transfer = await prisma.transfer.findFirst({
    where: { id: Number(transferId) },
  });
  return !!transfer;
}

// Creation Schema
const createTransferSchema = ajv.compile<CreateTransferInput>({
  type: 'object',
  $async: true,
  required: ['playerId', 'previousTeamId', 'newTeamId', 'fee', 'date'],

  properties: {
    playerId: {
      type: 'number',
      playerExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.PLAYER_ID_TYPE,
        playerExists: TRANSFER_MESSAGES.PLAYER_NOT_FOUND,
      },
    },

    previousTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.PREVIOUS_TEAM_ID_TYPE,
        teamExists: TRANSFER_MESSAGES.PREVIOUS_TEAM_NOT_FOUND,
      },
    },

    newTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.NEW_TEAM_ID_TYPE,
        teamExists: TRANSFER_MESSAGES.NEW_TEAM_NOT_FOUND,
      },
    },

    fee: {
      type: 'number',
      minimum: FEE_MIN,
      maximum: FEE_MAX,

      errorMessage: {
        type: TRANSFER_MESSAGES.FEE_TYPE,
        minimum: TRANSFER_MESSAGES.FEE_MIN,
        maximum: TRANSFER_MESSAGES.FEE_MAX,
      },
    },

    date: {
      type: 'string',
      format: 'date',

      errorMessage: {
        type: TRANSFER_MESSAGES.DATE_TYPE,
        format: TRANSFER_MESSAGES.DATE_FORMAT,
      },
    },
  },

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
    required: {
      playerId: TRANSFER_MESSAGES.PLAYER_ID_REQUIRED,
      previousTeamId: TRANSFER_MESSAGES.PREVIOUS_TEAM_ID_REQUIRED,
      newTeamId: TRANSFER_MESSAGES.NEW_TEAM_ID_REQUIRED,
      fee: TRANSFER_MESSAGES.FEE_REQUIRED,
      date: TRANSFER_MESSAGES.DATE_REQUIRED,
    },
  },
});

// Update Schema
const updateTransferSchema = ajv.compile<UpdateTransferInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      transferExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.ID_TYPE,
        transferExists: TRANSFER_MESSAGES.NOT_FOUND,
      },
    },

    playerId: {
      type: 'number',
      playerExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.PLAYER_ID_TYPE,
        playerExists: TRANSFER_MESSAGES.PLAYER_NOT_FOUND,
      },
    },

    previousTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.PREVIOUS_TEAM_ID_TYPE,
        teamExists: TRANSFER_MESSAGES.PREVIOUS_TEAM_NOT_FOUND,
      },
    },

    newTeamId: {
      type: 'number',
      teamExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.NEW_TEAM_ID_TYPE,
        teamExists: TRANSFER_MESSAGES.NEW_TEAM_NOT_FOUND,
      },
    },

    fee: {
      type: 'number',
      minimum: FEE_MIN,
      maximum: FEE_MAX,

      errorMessage: {
        type: TRANSFER_MESSAGES.FEE_TYPE,
        minimum: TRANSFER_MESSAGES.FEE_MIN,
        maximum: TRANSFER_MESSAGES.FEE_MAX,
      },
    },

    date: {
      type: 'string',
      format: 'date',

      errorMessage: {
        type: TRANSFER_MESSAGES.DATE_TYPE,
        format: TRANSFER_MESSAGES.DATE_FORMAT,
      },
    },
  },

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
    required: {
      id: TRANSFER_MESSAGES.ID_REQUIRED,
    },
  },
});

// Get Schema
const getTransferSchema = ajv.compile<GetTransferInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      transferExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.ID_TYPE,
        transferExists: TRANSFER_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
    required: {
      id: TRANSFER_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createTransferSchema,
  updateTransferSchema,
  getTransferSchema,
  TRANSFER_MESSAGES,
};
