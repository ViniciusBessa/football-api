import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  CreateSeasonInput,
  DeleteSeasonInput,
  UpdateSeasonInput,
} from '../../types/season-input';

// Field constraints
const YEAR_MIN = 1800;
const YEAR_MAX = new Date().getFullYear();

// Error messages
const SEASON_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  YEAR_TYPE: 'The year must be an integer number',
  YEAR_MIN: `The year must be at least ${YEAR_MIN}`,
  YEAR_MAX: `The maximum valid year is ${YEAR_MAX}`,
  YEAR_REQUIRED: "Please, provide the season's year",
  YEAR_IN_USE: 'There is already a season with the provided year',
  IS_CURRENT_TYPE: 'The is current season value must be a boolean',
  START_TYPE: 'The starting date is invalid',
  START_REQUIRED: "Please, provide the season's start date",
  END_TYPE: 'The endings date is invalid',
  END_REQUIRED: "Please, provide the season's end date",
  ID_TYPE: "The season's id must be a number or a string",
  ID_REQUIRED: "Please, provide the season's id",
  NOT_FOUND: 'No season was found with the provided id',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'yearIsAvailable',
  async: true,
  type: 'string',
  schema: false,
  validate: yearIsAvailable,
});

ajv.addKeyword({
  keyword: 'seasonExists',
  async: true,
  type: 'number',
  schema: false,
  validate: seasonExists,
});

async function yearIsAvailable(year: number): Promise<boolean> {
  const seasons = await prisma.season.findMany({
    where: { year },
  });
  return seasons.length === 0;
}

async function seasonExists(seasonId: number): Promise<boolean> {
  const season = await prisma.season.findFirst({
    where: { id: seasonId },
  });
  return !!season;
}

// Creation Schema
const createSeasonSchema = ajv.compile<CreateSeasonInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['year', 'start', 'end'],
      errorMessage: {
        required: {
          year: SEASON_MESSAGES.YEAR_REQUIRED,
          start: SEASON_MESSAGES.START_REQUIRED,
          end: SEASON_MESSAGES.END_REQUIRED,
        },
      },
    },
  ],

  properties: {
    year: {
      type: 'integer',
      min: YEAR_MIN,
      max: YEAR_MAX,
      yearIsAvailable: true,

      errorMessage: {
        type: SEASON_MESSAGES.YEAR_TYPE,
        min: SEASON_MESSAGES.YEAR_MIN,
        max: SEASON_MESSAGES.YEAR_MAX,
        yearIsAvailable: SEASON_MESSAGES.YEAR_IN_USE,
      },
    },

    start: {
      type: 'date',

      errorMessage: {
        type: SEASON_MESSAGES.START_TYPE,
      },
    },

    end: {
      type: 'end',

      errorMessage: {
        type: SEASON_MESSAGES.END_TYPE,
      },
    },

    isCurrent: {
      type: 'boolean',

      errorMessage: {
        type: SEASON_MESSAGES.IS_CURRENT_TYPE,
      },
    },
  },

  errorMessage: {
    type: SEASON_MESSAGES.OBJECT_TYPE,
  },
});

// Update Schema
const updateSeasonSchema = ajv.compile<UpdateSeasonInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: SEASON_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      seasonExists: true,

      errorMessage: {
        type: SEASON_MESSAGES.ID_TYPE,
        seasonExists: SEASON_MESSAGES.NOT_FOUND,
      },
    },

    year: {
      type: 'integer',
      min: YEAR_MIN,
      max: YEAR_MAX,
      yearIsAvailable: true,

      errorMessage: {
        type: SEASON_MESSAGES.YEAR_TYPE,
        min: SEASON_MESSAGES.YEAR_MIN,
        max: SEASON_MESSAGES.YEAR_MAX,
        yearIsAvailable: SEASON_MESSAGES.YEAR_IN_USE,
      },
    },

    start: {
      type: 'date',

      errorMessage: {
        type: SEASON_MESSAGES.START_TYPE,
      },
    },

    end: {
      type: 'end',

      errorMessage: {
        type: SEASON_MESSAGES.END_TYPE,
      },
    },

    isCurrent: {
      type: 'boolean',

      errorMessage: {
        type: SEASON_MESSAGES.IS_CURRENT_TYPE,
      },
    },
  },

  errorMessage: {
    type: SEASON_MESSAGES.OBJECT_TYPE,
  },
});

// Deletion Schema
const deleteSeasonSchema = ajv.compile<DeleteSeasonInput>({
  type: 'object',
  $async: true,

  allOf: [
    {
      required: ['id'],
      errorMessage: {
        required: {
          id: SEASON_MESSAGES.ID_REQUIRED,
        },
      },
    },
  ],

  properties: {
    id: {
      type: ['string', 'number'],
      seasonExists: true,

      errorMessage: {
        type: SEASON_MESSAGES.ID_TYPE,
        seasonExists: SEASON_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: SEASON_MESSAGES.OBJECT_TYPE,
  },
});

export {
  createSeasonSchema,
  updateSeasonSchema,
  deleteSeasonSchema,
  SEASON_MESSAGES,
  seasonExists,
};
