import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateTeamInput,
  DeleteTeamInput,
  UpdateTeamInput,
} from '../../types/team-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const TEAM_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createTeamSchema = ajv.compile<CreateTeamInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateTeamSchema = ajv.compile<UpdateTeamInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteTeamSchema = ajv.compile<DeleteTeamInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
  },
});
