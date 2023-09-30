import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreatePositionInput,
  GetPositionInput,
  UpdatePositionInput,
} from '../../types/position-input';

// Field constraints
const NAME_MIN_LENGTH = 6;
const NAME_MAX_LENGTH = 80;

// Error messages
const POSITION_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  NAME_TYPE: "The position's name must be a string",
  NAME_MIN_LENGTH: `The position's name must be at least ${NAME_MIN_LENGTH} characters long`,
  NAME_MAX_LENGTH: `The maximum number of characters for the position's name is ${NAME_MAX_LENGTH}`,
  NAME_REQUIRED: 'Please, provide a name for the position',
  NAME_IN_USE: 'The position provided is already in use',
  NOT_FOUND: 'No position was found with the provided id',
  ID_TYPE: "The position's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a position',
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

async function nameIsAvailable(name: string): Promise<boolean> {
  const positions = await prisma.position.findMany({
    where: { name },
  });
  return positions.length === 0;
}

async function positionExists(positionId: number): Promise<boolean> {
  const position = await prisma.position.findFirst({
    where: { id: positionId },
  });
  return !!position;
}

// Creation Schema
const createPositionSchema = ajv.compile<CreatePositionInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['name'],
      errorMessage: {
        required: {
          name: POSITION_MESSAGES.NAME_REQUIRED,
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
        type: POSITION_MESSAGES.NAME_TYPE,
        minLength: POSITION_MESSAGES.NAME_MIN_LENGTH,
        maxLength: POSITION_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: POSITION_MESSAGES.NAME_IN_USE,
      },
    },
  },
  errorMessage: {
    type: POSITION_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updatePositionSchema = ajv.compile<UpdatePositionInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: POSITION_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      positionExists: true,

      errorMessage: {
        type: POSITION_MESSAGES.ID_TYPE,
        positionExists: POSITION_MESSAGES.NOT_FOUND,
      },
    },

    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: POSITION_MESSAGES.NAME_TYPE,
        minLength: POSITION_MESSAGES.NAME_MIN_LENGTH,
        maxLength: POSITION_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: POSITION_MESSAGES.NAME_IN_USE,
      },
    },
  },
  errorMessage: {
    type: POSITION_MESSAGES.OBJECT_TYPE,
  },
});

// Get Schema
const getPositionSchema = ajv.compile<GetPositionInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: POSITION_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      positionExists: true,

      errorMessage: {
        type: POSITION_MESSAGES.ID_TYPE,
        positionExists: POSITION_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: POSITION_MESSAGES.OBJECT_TYPE,
  },
});

export {
  createPositionSchema,
  updatePositionSchema,
  getPositionSchema,
  POSITION_MESSAGES,
  positionExists,
};
