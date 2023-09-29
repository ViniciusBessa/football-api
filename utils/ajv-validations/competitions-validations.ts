import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateCompetitionInput,
  DeleteCompetitionInput,
  UpdateCompetitionInput,
} from '../../types/competition-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const COMPETITION_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createCompetitionSchema = ajv.compile<CreateCompetitionInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: COMPETITION_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateCompetitionSchema = ajv.compile<UpdateCompetitionInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: COMPETITION_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteCompetitionSchema = ajv.compile<DeleteCompetitionInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: COMPETITION_MESSAGES.OBJECT_TYPE,
  },
});
