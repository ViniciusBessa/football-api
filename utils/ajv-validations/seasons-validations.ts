import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateSeasonInput,
  DeleteSeasonInput,
  UpdateSeasonInput,
} from '../../types/season-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const SEASON_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createSeasonSchema = ajv.compile<CreateSeasonInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: SEASON_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateSeasonSchema = ajv.compile<UpdateSeasonInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: SEASON_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteSeasonSchema = ajv.compile<DeleteSeasonInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: SEASON_MESSAGES.OBJECT_TYPE,
  },
});
