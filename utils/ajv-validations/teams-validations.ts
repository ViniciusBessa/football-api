import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import {
  CreateTeamInput,
  GetTeamInput,
  UpdateTeamInput,
} from '../../types/team-input';
import { countryExists } from './countries-validations';

// Field constraints
const NAME_MIN_LENGTH = 6;
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 3;
const FOUNDING_DATE_MIN = new Date('1800-01-01').toISOString();
const FOUNDING_DATE_MAX = new Date().toISOString();

// Error messages
const TEAM_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  NAME_TYPE: "The team's name must be a string",
  NAME_MIN_LENGTH: `The team's name must be at least ${NAME_MIN_LENGTH} characters long`,
  NAME_MAX_LENGTH: `The maximum number of characters for the team's name is ${NAME_MAX_LENGTH}`,
  NAME_REQUIRED: 'Please, provide a name for the team',
  NAME_IN_USE: "The team's name provided is already in use",
  LOGO_URL_TYPE: "The team's logo url must be a string",
  LOGO_URL_REQUIRED: "Please, provide an url to the team's logo",
  CODE_TYPE: "The team's code must be a string",
  CODE_LENGTH: `The team's code must have exactly ${CODE_LENGTH} characters`,
  CODE_REQUIRED: 'Please, provide a code to the team',
  CODE_IN_USE: 'The code provided is already in use',
  FOUNDING_DATE_MIN: `The team's founding year must be at least ${FOUNDING_DATE_MIN}`,
  FOUNDING_DATE_MAX: `The maximum valid year for the founding year is ${FOUNDING_DATE_MAX}`,
  FOUNDING_DATE_TYPE: "The team's founding year must be a string",
  FOUNDING_DATE_FORMAT: "The team's founding year must be formatted as a date",
  FOUNDING_DATE_REQUIRED: "Please, provide the team's founding year",
  IS_NATIONAL_TYPE: "The team's 'is national' must be a boolean value",
  COUNTRY_ID_TYPE: "The country's id must be a number or a string",
  COUNTRY_ID_REQUIRED: "Please, provide the id of the team's country",
  COUNTRY_NOT_FOUND: 'No country was found with the id provided',
  NOT_FOUND: 'No team was found with the provided id',
  ID_TYPE: "The team's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a team',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));
addFormats(ajv);

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'nameIsAvailable',
  async: true,
  schema: false,
  validate: nameIsAvailable,
});

ajv.addKeyword({
  keyword: 'codeIsAvailable',
  async: true,
  schema: false,
  validate: codeIsAvailable,
});

ajv.addKeyword({
  keyword: 'teamExists',
  async: true,
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'countryExists',
  async: true,
  schema: false,
  validate: countryExists,
});

async function nameIsAvailable(name: string): Promise<boolean> {
  const teams = await prisma.team.findMany({
    where: { name },
  });
  return teams.length === 0;
}

async function codeIsAvailable(code: string): Promise<boolean> {
  const teams = await prisma.team.findMany({
    where: { code },
  });
  return teams.length === 0;
}

async function teamExists(teamId: string | number): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: { id: Number(teamId) },
  });
  return !!team;
}

// Creation Schema
const createTeamSchema = ajv.compile<CreateTeamInput>({
  type: 'object',
  $async: true,
  required: ['name', 'code', 'logoUrl', 'foundingDate', 'countryId'],

  properties: {
    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: TEAM_MESSAGES.NAME_TYPE,
        minLength: TEAM_MESSAGES.NAME_MIN_LENGTH,
        maxLength: TEAM_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: TEAM_MESSAGES.NAME_IN_USE,
      },
    },

    code: {
      type: 'string',
      minLength: CODE_LENGTH,
      maxLength: CODE_LENGTH,
      codeIsAvailable: true,

      errorMessage: {
        type: TEAM_MESSAGES.CODE_TYPE,
        minLength: TEAM_MESSAGES.CODE_LENGTH,
        maxLength: TEAM_MESSAGES.CODE_LENGTH,
        codeIsAvailable: TEAM_MESSAGES.CODE_IN_USE,
      },
    },

    logoUrl: {
      type: 'string',

      errorMessage: {
        type: TEAM_MESSAGES.LOGO_URL_TYPE,
      },
    },

    foundingDate: {
      type: 'string',
      format: 'date-time',
      formatMinimum: FOUNDING_DATE_MIN,
      formatMaximum: FOUNDING_DATE_MAX,

      errorMessage: {
        type: TEAM_MESSAGES.FOUNDING_DATE_TYPE,
        format: TEAM_MESSAGES.FOUNDING_DATE_FORMAT,
        formatMinimum: TEAM_MESSAGES.FOUNDING_DATE_MIN,
        formatMaximum: TEAM_MESSAGES.FOUNDING_DATE_MAX,
      },
    },

    isNational: {
      type: 'boolean',

      errorMessage: {
        type: TEAM_MESSAGES.IS_NATIONAL_TYPE,
      },
    },

    countryId: {
      type: 'number',
      countryExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: TEAM_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
    required: {
      name: TEAM_MESSAGES.NAME_REQUIRED,
      code: TEAM_MESSAGES.CODE_REQUIRED,
      logoUrl: TEAM_MESSAGES.LOGO_URL_REQUIRED,
      foundingDate: TEAM_MESSAGES.FOUNDING_DATE_REQUIRED,
      countryId: TEAM_MESSAGES.COUNTRY_ID_REQUIRED,
    },
  },
});

// Update Schema
const updateTeamSchema = ajv.compile<UpdateTeamInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      teamExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.ID_TYPE,
        teamExists: TEAM_MESSAGES.NOT_FOUND,
      },
    },

    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: TEAM_MESSAGES.NAME_TYPE,
        minLength: TEAM_MESSAGES.NAME_MIN_LENGTH,
        maxLength: TEAM_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: TEAM_MESSAGES.NAME_IN_USE,
      },
    },

    code: {
      type: 'string',
      minLength: CODE_LENGTH,
      maxLength: CODE_LENGTH,
      codeIsAvailable: true,

      errorMessage: {
        type: TEAM_MESSAGES.CODE_TYPE,
        minLength: TEAM_MESSAGES.CODE_LENGTH,
        maxLength: TEAM_MESSAGES.CODE_LENGTH,
        codeIsAvailable: TEAM_MESSAGES.CODE_IN_USE,
      },
    },

    logoUrl: {
      type: 'string',

      errorMessage: {
        type: TEAM_MESSAGES.LOGO_URL_TYPE,
      },
    },

    foundingDate: {
      type: 'string',
      format: 'date-time',
      formatMinimum: FOUNDING_DATE_MIN,
      formatMaximum: FOUNDING_DATE_MAX,

      errorMessage: {
        type: TEAM_MESSAGES.FOUNDING_DATE_TYPE,
        format: TEAM_MESSAGES.FOUNDING_DATE_FORMAT,
        formatMinimum: TEAM_MESSAGES.FOUNDING_DATE_MIN,
        formatMaximum: TEAM_MESSAGES.FOUNDING_DATE_MAX,
      },
    },

    isNational: {
      type: 'boolean',

      errorMessage: {
        type: TEAM_MESSAGES.IS_NATIONAL_TYPE,
      },
    },

    countryId: {
      type: 'number',
      countryExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: TEAM_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
    required: {
      id: TEAM_MESSAGES.ID_REQUIRED,
    },
  },
});

// Get Schema
const getTeamSchema = ajv.compile<GetTeamInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      teamExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.ID_TYPE,
        teamExists: TEAM_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
    required: {
      id: TEAM_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createTeamSchema,
  updateTeamSchema,
  getTeamSchema,
  teamExists,
  TEAM_MESSAGES,
};
