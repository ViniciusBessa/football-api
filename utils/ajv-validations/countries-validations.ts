import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateCountryInput,
  DeleteCountryInput,
  UpdateCountryInput,
} from '../../types/country-input';

// Field constraints
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const COUNTRY_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

// Creation Schema
const createCountrySchema = ajv.compile<CreateCountryInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: COUNTRY_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateCountrySchema = ajv.compile<UpdateCountryInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: COUNTRY_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteCountrySchema = ajv.compile<DeleteCountryInput>({
  type: 'object',
  $async: true,

  errorMessage: {
    type: COUNTRY_MESSAGES.OBJECT_TYPE,
  },
});
