import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateTeamInput,
  DeleteTeamInput,
  UpdateTeamInput,
} from '../../types/team-input';
import { countryExists } from './countries-validations';

// Field constraints
const NAME_MIN_LENGTH = 6;
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;
const FOUNDING_YEAR_MIN = 1800;
const FOUNDING_YEAR_MAX = new Date().getFullYear();

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
  FOUNDING_YEAR_MIN: `The team's founding year must be at least ${FOUNDING_YEAR_MIN}`,
  FOUNDING_YEAR_MAX: `The maximum valid year for the founding year is ${FOUNDING_YEAR_MAX}`,
  FOUNDING_YEAR_TYPE: "The team's founding year must be a date",
  FOUNDING_YEAR_REQUIRED: "Please, provide the team's founding year",
  IS_NATIONAL_TYPE: "The team's 'is national' must be a boolean value",
  COUNTRY_ID_TYPE: "The country's id must be a number or a string",
  COUNTRY_ID_REQUIRED: "Please, provide the id of the team's country",
  COUNTRY_NOT_FOUND: 'No country was found with the id provided',
  NOT_FOUND: 'No team was found with the provided id',
  ID_TYPE: "The team's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a team',
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
  keyword: 'teamExists',
  async: true,
  type: 'number',
  schema: false,
  validate: teamExists,
});

ajv.addKeyword({
  keyword: 'countryExists',
  async: true,
  type: 'number',
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

async function teamExists(teamId: number): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: { id: teamId },
  });
  return !!team;
}

// Creation Schema
const createTeamSchema = ajv.compile<CreateTeamInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['name', 'code', 'logoUrl', 'foundingYear', 'countryId'],
      errorMessage: {
        required: {
          name: TEAM_MESSAGES.NAME_REQUIRED,
          code: TEAM_MESSAGES.CODE_REQUIRED,
          logoUrl: TEAM_MESSAGES.LOGO_URL_REQUIRED,
          foundingYear: TEAM_MESSAGES.FOUNDING_YEAR_REQUIRED,
          countryId: TEAM_MESSAGES.COUNTRY_ID_REQUIRED,
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

    foundingYear: {
      type: 'date',
      min: FOUNDING_YEAR_MIN,
      max: FOUNDING_YEAR_MAX,

      errorMessage: {
        type: TEAM_MESSAGES.FOUNDING_YEAR_TYPE,
        min: TEAM_MESSAGES.FOUNDING_YEAR_MIN,
        max: TEAM_MESSAGES.FOUNDING_YEAR_MAX,
      },
    },

    isNational: {
      type: 'boolean',

      errorMessage: {
        type: TEAM_MESSAGES.IS_NATIONAL_TYPE,
      },
    },

    countryId: {
      type: ['string', 'number'],
      countryExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: TEAM_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateTeamSchema = ajv.compile<UpdateTeamInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: TEAM_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.ID_TYPE,
        countryExists: TEAM_MESSAGES.NOT_FOUND,
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

    foundingYear: {
      type: 'date',
      min: FOUNDING_YEAR_MIN,
      max: FOUNDING_YEAR_MAX,

      errorMessage: {
        type: TEAM_MESSAGES.FOUNDING_YEAR_TYPE,
        min: TEAM_MESSAGES.FOUNDING_YEAR_MIN,
        max: TEAM_MESSAGES.FOUNDING_YEAR_MAX,
      },
    },

    isNational: {
      type: 'boolean',

      errorMessage: {
        type: TEAM_MESSAGES.IS_NATIONAL_TYPE,
      },
    },

    countryId: {
      type: ['string', 'number'],
      countryExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.COUNTRY_ID_TYPE,
        countryExists: TEAM_MESSAGES.COUNTRY_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteTeamSchema = ajv.compile<DeleteTeamInput>({
  type: 'object',
  $async: true,

  allof: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: TEAM_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      teamExists: true,

      errorMessage: {
        type: TEAM_MESSAGES.ID_TYPE,
        teamExists: TEAM_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TEAM_MESSAGES.OBJECT_TYPE,
  },
});

export { createTeamSchema, updateTeamSchema, deleteTeamSchema, teamExists };
