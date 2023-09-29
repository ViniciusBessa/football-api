import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateTrophyInput,
  DeleteTrophyInput,
  UpdateTrophyInput,
} from '../../types/trophy-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const TROPHY_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createTrophySchema = ajv.compile<CreateTrophyInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TROPHY_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateTrophySchema = ajv.compile<UpdateTrophyInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TROPHY_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteTrophySchema = ajv.compile<DeleteTrophyInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TROPHY_MESSAGES.OBJECT_TYPE,
  },
});
