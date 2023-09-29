import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreatePositionInput,
  DeletePositionInput,
  UpdatePositionInput,
} from '../../types/position-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const POSITION_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createPositionSchema = ajv.compile<CreatePositionInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: POSITION_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updatePositionSchema = ajv.compile<UpdatePositionInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: POSITION_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deletePositionSchema = ajv.compile<DeletePositionInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: POSITION_MESSAGES.OBJECT_TYPE,
  },
});
