import { CompetitionType, PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateCompetitionInput,
  DeleteCompetitionInput,
  UpdateCompetitionInput,
} from '../../types/competition-input';

// Field constraints
const NAME_MIN_LENGTH = 6;
const NAME_MAX_LENGTH = 80;
const CODE_LENGTH = 2;

// Error messages
const COMPETITION_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  NAME_TYPE: "The competition's name must be a string",
  NAME_MIN_LENGTH: `The competition's name must be at least ${NAME_MIN_LENGTH} characters long`,
  NAME_MAX_LENGTH: `The maximum number of characters for the competition's name is ${NAME_MAX_LENGTH}`,
  NAME_REQUIRED: 'Please, provide a name for the competition',
  NAME_IN_USE: "The competition's name provided is already in use",
  LOGO_URL_TYPE: "The competition's logo url must be a string",
  LOGO_URL_REQUIRED: "Please, provide an url to the competition's logo",
  CODE_TYPE: "The competition's code must be a string",
  CODE_LENGTH: `The competition's code must have exactly ${CODE_LENGTH} characters`,
  CODE_REQUIRED: 'Please, provide a code to the competition',
  CODE_IN_USE: 'The code provided is already in use',
  TYPE: "The competition's type must be league or cup",
  TYPE_REQUIRED: "Please, provide the competition's type",
  NOT_FOUND: 'No competition was found with the provided id',
  ID_TYPE: "The competition's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a competition',
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
  keyword: 'competitionExists',
  async: true,
  type: 'number',
  schema: false,
  validate: competitionExists,
});

async function nameIsAvailable(name: string): Promise<boolean> {
  const competitions = await prisma.competition.findMany({
    where: { name },
  });
  return competitions.length === 0;
}

async function codeIsAvailable(code: string): Promise<boolean> {
  const competitions = await prisma.competition.findMany({
    where: { code },
  });
  return competitions.length === 0;
}

async function competitionExists(competitionId: number): Promise<boolean> {
  const competition = await prisma.competition.findFirst({
    where: { id: competitionId },
  });
  return !!competition;
}

// Creation Schema
const createCompetitionSchema = ajv.compile<CreateCompetitionInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['name', 'code', 'logoUrl', 'type'],
      errorMessage: {
        required: {
          name: COMPETITION_MESSAGES.NAME_REQUIRED,
          code: COMPETITION_MESSAGES.CODE_REQUIRED,
          logoUrl: COMPETITION_MESSAGES.LOGO_URL_REQUIRED,
          type: COMPETITION_MESSAGES.TYPE_REQUIRED,
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
        type: COMPETITION_MESSAGES.NAME_TYPE,
        minLength: COMPETITION_MESSAGES.NAME_MIN_LENGTH,
        maxLength: COMPETITION_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: COMPETITION_MESSAGES.NAME_IN_USE,
      },
    },

    code: {
      type: 'string',
      minLength: CODE_LENGTH,
      maxLength: CODE_LENGTH,
      codeIsAvailable: true,

      errorMessage: {
        type: COMPETITION_MESSAGES.CODE_TYPE,
        minLength: COMPETITION_MESSAGES.CODE_LENGTH,
        maxLength: COMPETITION_MESSAGES.CODE_LENGTH,
        codeIsAvailable: COMPETITION_MESSAGES.CODE_IN_USE,
      },
    },

    logoUrl: {
      type: 'string',

      errorMessage: {
        type: COMPETITION_MESSAGES.LOGO_URL_TYPE,
      },
    },

    type: {
      enum: [CompetitionType.CUP, CompetitionType.LEAGUE],

      errorMessage: {
        type: COMPETITION_MESSAGES.TYPE,
      },
    },
  },

  errorMessage: {
    type: COMPETITION_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateCompetitionSchema = ajv.compile<UpdateCompetitionInput>({
  type: 'object',
  $async: true,

  allof: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: COMPETITION_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      competitionExists: true,

      errorMessage: {
        type: COMPETITION_MESSAGES.ID_TYPE,
        competitionExists: COMPETITION_MESSAGES.NOT_FOUND,
      },
    },
    name: {
      type: 'string',
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      nameIsAvailable: true,

      errorMessage: {
        type: COMPETITION_MESSAGES.NAME_TYPE,
        minLength: COMPETITION_MESSAGES.NAME_MIN_LENGTH,
        maxLength: COMPETITION_MESSAGES.NAME_MAX_LENGTH,
        nameIsAvailable: COMPETITION_MESSAGES.NAME_IN_USE,
      },
    },

    code: {
      type: 'string',
      minLength: CODE_LENGTH,
      maxLength: CODE_LENGTH,
      codeIsAvailable: true,

      errorMessage: {
        type: COMPETITION_MESSAGES.CODE_TYPE,
        minLength: COMPETITION_MESSAGES.CODE_LENGTH,
        maxLength: COMPETITION_MESSAGES.CODE_LENGTH,
        codeIsAvailable: COMPETITION_MESSAGES.CODE_IN_USE,
      },
    },

    logoUrl: {
      type: 'string',

      errorMessage: {
        type: COMPETITION_MESSAGES.LOGO_URL_TYPE,
      },
    },

    type: {
      enum: [CompetitionType.CUP, CompetitionType.LEAGUE],

      errorMessage: {
        type: COMPETITION_MESSAGES.TYPE,
      },
    },
  },

  errorMessage: {
    type: COMPETITION_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteCompetitionSchema = ajv.compile<DeleteCompetitionInput>({
  type: 'object',
  $async: true,

  allof: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: COMPETITION_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      competitionExists: true,

      errorMessage: {
        type: COMPETITION_MESSAGES.ID_TYPE,
        competitionExists: COMPETITION_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: COMPETITION_MESSAGES.OBJECT_TYPE,
  },
});

export {
  createCompetitionSchema,
  updateCompetitionSchema,
  deleteCompetitionSchema,
  competitionExists,
};
