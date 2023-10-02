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
  schema: false,
  validate: nameIsAvailable,
});

ajv.addKeyword({
  keyword: 'positionExists',
  async: true,
  schema: false,
  validate: positionExists,
});

async function nameIsAvailable(name: string): Promise<boolean> {
  const positions = await prisma.position.findMany({
    where: { name },
  });
  return positions.length === 0;
}

async function positionExists(positionId: string | number): Promise<boolean> {
  const position = await prisma.position.findFirst({
    where: { id: Number(positionId) },
  });
  return !!position;
}

// Creation Schema
const createPositionSchema = ajv.compile<CreatePositionInput>({
  type: 'object',
  $async: true,
  required: ['name'],

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
    required: {
      name: POSITION_MESSAGES.NAME_REQUIRED,
    },
  },
});

// Update Schema
const updatePositionSchema = ajv.compile<UpdatePositionInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
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
    required: {
      id: POSITION_MESSAGES.ID_REQUIRED,
    },
  },
});

// Get Schema
const getPositionSchema = ajv.compile<GetPositionInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      positionExists: true,

      errorMessage: {
        type: POSITION_MESSAGES.ID_TYPE,
        positionExists: POSITION_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: POSITION_MESSAGES.OBJECT_TYPE,
    required: {
      id: POSITION_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createPositionSchema,
  updatePositionSchema,
  getPositionSchema,
  POSITION_MESSAGES,
  positionExists,
};
