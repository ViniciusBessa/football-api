import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateMatchGoalInput,
  DeleteMatchGoalInput,
  UpdateMatchGoalInput,
} from '../../types/match-goal-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const MATCHGOAL_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createMatchGoalSchema = ajv.compile<CreateMatchGoalInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: MATCHGOAL_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateMatchGoalSchema = ajv.compile<UpdateMatchGoalInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: MATCHGOAL_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteMatchGoalSchema = ajv.compile<DeleteMatchGoalInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: MATCHGOAL_MESSAGES.OBJECT_TYPE,
  },
});
