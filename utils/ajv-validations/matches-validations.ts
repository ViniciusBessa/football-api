import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateMatchInput,
  DeleteMatchInput,
  UpdateMatchInput,
} from '../../types/match-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const MATCH_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createMatchSchema = ajv.compile<CreateMatchInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateMatchSchema = ajv.compile<UpdateMatchInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteMatchSchema = ajv.compile<DeleteMatchInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: MATCH_MESSAGES.OBJECT_TYPE,
  },
});
