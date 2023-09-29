import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreatePlayerInput,
  DeletePlayerInput,
  UpdatePlayerInput,
} from '../../types/player-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const PLAYER_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createPlayerSchema = ajv.compile<CreatePlayerInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updatePlayerSchema = ajv.compile<UpdatePlayerInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deletePlayerSchema = ajv.compile<DeletePlayerInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: PLAYER_MESSAGES.OBJECT_TYPE,
  },
});
