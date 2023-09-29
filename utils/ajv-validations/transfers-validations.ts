import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateTransferInput,
  DeleteTransferInput,
  UpdateTransferInput,
} from '../../types/transfer-input';
import { playerExists } from './players-validations';
import { teamExists } from './teams-validations';

// Field constraints
const TRANSFER_FEE_MIN = 1000;
const TRANSFER_FEE_MAX = 9999999999;

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
  TRANSFER_FEE_TYPE: 'The transfer fee must be a number',
  TRANSFER_FEE_MIN: `The transfer fee must be at least ${TRANSFER_FEE_MIN}`,
  TRANSFER_FEE_MAX: `The maximum value for a transfer is ${TRANSFER_FEE_MAX}`,
  TRANSFER_FEE_REQUIRED: "Please, provide the transfer's fee",
  DATE_TYPE: "The transfer's timestamp must be a date",
  DATE_REQUIRED: "Please, provide the transfer's date",
  ID_TYPE: "The type of the transfer's id must be string or number",
  ID_REQUIRED: 'Please, provide the id of the transfer',
  NOT_FOUND: 'No transfer was found with the id provided',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'teamExists',
  async: true,
  type: 'string',
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'playerExists',
  async: true,
  type: 'string',
  schema: false,
  validate: playerExists,
});

ajv.addKeyword({
  keyword: 'transferExists',
  async: true,
  type: 'string',
  schema: false,
  validate: transferExists,
});

async function transferExists(transferId: number): Promise<boolean> {
  const transfer = await prisma.transfer.findFirst({
    where: { id: transferId },
  });
  return !!transfer;
}

// Creation Schema
const createTransferSchema = ajv.compile<CreateTransferInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: [
        'playerId',
        'previousTeamId',
        'newTeamId',
        'transferFee',
        'date',
      ],

      errorMessage: {
        required: {
          playerId: TRANSFER_MESSAGES.PLAYER_ID_REQUIRED,
          previousTeamId: TRANSFER_MESSAGES.PREVIOUS_TEAM_ID_REQUIRED,
          newTeamId: TRANSFER_MESSAGES.NEW_TEAM_ID_REQUIRED,
          transferFee: TRANSFER_MESSAGES.TRANSFER_FEE_REQUIRED,
          date: TRANSFER_MESSAGES.DATE_REQUIRED,
        },
      },
    },
  ],

  properties: {
    playerId: {
      type: ['string', 'number'],
      playerExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.PLAYER_ID_TYPE,
        playerExists: TRANSFER_MESSAGES.PLAYER_NOT_FOUND,
      },
    },

    previousTeamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.PREVIOUS_TEAM_ID_TYPE,
        teamExists: TRANSFER_MESSAGES.PREVIOUS_TEAM_NOT_FOUND,
      },
    },

    newTeamId: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.NEW_TEAM_ID_TYPE,
        teamExists: TRANSFER_MESSAGES.NEW_TEAM_NOT_FOUND,
      },
    },

    transferFee: {
      type: 'number',
      min: TRANSFER_FEE_MIN,
      max: TRANSFER_FEE_MAX,

      errorMessage: {
        type: TRANSFER_MESSAGES.TRANSFER_FEE_TYPE,
        min: TRANSFER_MESSAGES.TRANSFER_FEE_MIN,
        max: TRANSFER_MESSAGES.TRANSFER_FEE_MAX,
      },
    },

    date: {
      type: 'date',

      errorMessage: {
        type: TRANSFER_MESSAGES.DATE_TYPE,
      },
    },
  },

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateTransferSchema = ajv.compile<UpdateTransferInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: TRANSFER_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      transferExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.ID_TYPE,
        transferExists: TRANSFER_MESSAGES.NOT_FOUND,
      },
    },

    properties: {
      playerId: {
        type: ['string', 'number'],
        playerExists: true,

        errorMessage: {
          type: TRANSFER_MESSAGES.PLAYER_ID_TYPE,
          playerExists: TRANSFER_MESSAGES.PLAYER_NOT_FOUND,
        },
      },

      previousTeamId: {
        type: ['string', 'number'],
        teamExists: true,

        errorMessage: {
          type: TRANSFER_MESSAGES.PREVIOUS_TEAM_ID_TYPE,
          teamExists: TRANSFER_MESSAGES.PREVIOUS_TEAM_NOT_FOUND,
        },
      },

      newTeamId: {
        type: ['string', 'number'],
        teamExists: true,

        errorMessage: {
          type: TRANSFER_MESSAGES.NEW_TEAM_ID_TYPE,
          teamExists: TRANSFER_MESSAGES.NEW_TEAM_NOT_FOUND,
        },
      },

      transferFee: {
        type: 'number',
        min: TRANSFER_FEE_MIN,
        max: TRANSFER_FEE_MAX,

        errorMessage: {
          type: TRANSFER_MESSAGES.TRANSFER_FEE_TYPE,
          min: TRANSFER_MESSAGES.TRANSFER_FEE_MIN,
          max: TRANSFER_MESSAGES.TRANSFER_FEE_MAX,
        },
      },

      date: {
        type: 'date',

        errorMessage: {
          type: TRANSFER_MESSAGES.DATE_TYPE,
        },
      },
    },
  },

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteTransferSchema = ajv.compile<DeleteTransferInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: TRANSFER_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      transferExists: true,

      errorMessage: {
        type: TRANSFER_MESSAGES.ID_TYPE,
        transferExists: TRANSFER_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
  },
});

export {
  createTransferSchema,
  updateTransferSchema,
  deleteTransferSchema,
  TRANSFER_MESSAGES,
};
