import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateCountryInput,
  GetCountryInput,
  UpdateCountryInput,
} from '../../types/country-input';

// Field constraints
const NAME_MIN_LENGTH = 4;
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const COUNTRY_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  NAME_TYPE: "The country's name must be a string",
  NAME_MIN_LENGTH: `The country's name must be at least ${NAME_MIN_LENGTH} characters long`,
  NAME_MAX_LENGTH: `The maximum number of characters for the country's name is ${NAME_MAX_LENGTH}`,
  NAME_REQUIRED: 'Please, provide a name for the country',
  NAME_IN_USE: "The country's name provided is already in use",
  FLAG_URL_TYPE: "The country's flag url must be a string",
  FLAG_URL_REQUIRED: "Please, provide an url to the country's flag",
  CODE_TYPE: "The country's code must be a string",
  CODE_LENGTH: `The country's code must have exactly ${CODE_LENGTH} characters`,
  CODE_REQUIRED: 'Please, provide a code to the country',
  CODE_IN_USE: 'The code provided is already in use',
  NOT_FOUND: 'No country was found with the provided id',
  ID_TYPE: "The country's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a country',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'nameIsAvailable',
  async: true,
  type: 'string',
  schema: false,
  validate: nameIsAvailable,
});

ajv.addKeyword({
  keyword: 'codeIsAvailable',
  async: true,
  type: 'string',
  schema: false,
  validate: codeIsAvailable,
});

ajv.addKeyword({
  keyword: 'countryExists',
  async: true,
  type: 'number',
  schema: false,
  validate: countryExists,
});

async function nameIsAvailable(name: string): Promise<boolean> {
  const countries = await prisma.country.findMany({
    where: { name },
  });
  return countries.length === 0;
}

async function codeIsAvailable(code: string): Promise<boolean> {
  const countries = await prisma.country.findMany({
    where: { code },
  });
  return countries.length === 0;
}

async function countryExists(countryId: number): Promise<boolean> {
  const country = await prisma.country.findFirst({
    where: { id: countryId },
  });
  return !!country;
}

// Creation Schema
const createCountrySchema = ajv.compile<CreateCountryInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['name', 'code', 'flagUrl'],
      errorMessage: {
        required: {
          name: COUNTRY_MESSAGES.NAME_REQUIRED,
          code: COUNTRY_MESSAGES.CODE_REQUIRED,
          flagUrl: COUNTRY_MESSAGES.FLAG_URL_REQUIRED,
        },
      },
    },
  ],

  properties: {
    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: COUNTRY_MESSAGES.NAME_TYPE,
        minLength: COUNTRY_MESSAGES.NAME_MIN_LENGTH,
        maxLength: COUNTRY_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: COUNTRY_MESSAGES.NAME_IN_USE,
      },
    },

    code: {
      type: 'string',
      minLength: CODE_LENGTH,
      maxLength: CODE_LENGTH,
      codeIsAvailable: true,

      errorMessage: {
        type: COUNTRY_MESSAGES.CODE_TYPE,
        minLength: COUNTRY_MESSAGES.CODE_LENGTH,
        maxLength: COUNTRY_MESSAGES.CODE_LENGTH,
        codeIsAvailable: COUNTRY_MESSAGES.CODE_IN_USE,
      },
    },

    flagUrl: {
      type: 'string',

      errorMessage: {
        type: COUNTRY_MESSAGES.FLAG_URL_TYPE,
      },
    },
  },

  errorMessage: {
    type: COUNTRY_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateCountrySchema = ajv.compile<UpdateCountryInput>({
  type: 'object',
  $async: true,

  allof: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: COUNTRY_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      countryExists: true,

      errorMessage: {
        type: COUNTRY_MESSAGES.ID_TYPE,
        countryExists: COUNTRY_MESSAGES.NOT_FOUND,
      },
    },
    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: COUNTRY_MESSAGES.NAME_TYPE,
        minLength: COUNTRY_MESSAGES.NAME_MIN_LENGTH,
        maxLength: COUNTRY_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: COUNTRY_MESSAGES.NAME_IN_USE,
      },
    },

    code: {
      type: 'string',
      minLength: CODE_LENGTH,
      maxLength: CODE_LENGTH,
      codeIsAvailable: true,

      errorMessage: {
        type: COUNTRY_MESSAGES.CODE_TYPE,
        minLength: COUNTRY_MESSAGES.CODE_LENGTH,
        maxLength: COUNTRY_MESSAGES.CODE_LENGTH,
        codeIsAvailable: COUNTRY_MESSAGES.CODE_IN_USE,
      },
    },

    flagUrl: {
      type: 'string',

      errorMessage: {
        type: COUNTRY_MESSAGES.FLAG_URL_TYPE,
      },
    },
  },

  errorMessage: {
    type: COUNTRY_MESSAGES.OBJECT_TYPE,
  },
});

// Get Schema
const getCountrySchema = ajv.compile<GetCountryInput>({
  type: 'object',
  $async: true,

  allof: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: COUNTRY_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      countryExists: true,

      errorMessage: {
        type: COUNTRY_MESSAGES.ID_TYPE,
        countryExists: COUNTRY_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: COUNTRY_MESSAGES.OBJECT_TYPE,
  },
});

export {
  createCountrySchema,
  updateCountrySchema,
  getCountrySchema,
  COUNTRY_MESSAGES,
  countryExists,
};
