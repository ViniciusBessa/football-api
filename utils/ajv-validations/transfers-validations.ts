import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateTransferInput,
  DeleteTransferInput,
  UpdateTransferInput,
} from '../../types/transfer-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const TRANSFER_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createTransferSchema = ajv.compile<CreateTransferInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateTransferSchema = ajv.compile<UpdateTransferInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteTransferSchema = ajv.compile<DeleteTransferInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: TRANSFER_MESSAGES.OBJECT_TYPE,
  },
});
