import { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import {
  CreateSeasonInput,
  GetSeasonInput,
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
  START_TYPE: 'The starting date must be a string',
  START_FORMAT: 'The starting date must be formatted as a date',
  START_REQUIRED: "Please, provide the season's start date",
  END_TYPE: 'The ending date must be a string',
  END_FORMAT: 'The ending date must be formatted as a date',
  END_REQUIRED: "Please, provide the season's end date",
  ID_TYPE: "The season's id must be a number or a string",
  ID_REQUIRED: "Please, provide the season's id",
  NOT_FOUND: 'No season was found with the provided id',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));
addFormats(ajv);

// Extra Keywords
const prisma = new PrismaClient();

ajv.addKeyword({
  keyword: 'yearIsAvailable',
  async: true,
  schema: false,
  validate: yearIsAvailable,
});

ajv.addKeyword({
  keyword: 'seasonExists',
  async: true,
  schema: false,
  validate: seasonExists,
});

async function yearIsAvailable(year: number): Promise<boolean> {
  const seasons = await prisma.season.findMany({
    where: { year },
  });
  return seasons.length === 0;
}

async function seasonExists(seasonId: string | number): Promise<boolean> {
  const season = await prisma.season.findFirst({
    where: { id: Number(seasonId) },
  });
  return !!season;
}

// Creation Schema
const createSeasonSchema = ajv.compile<CreateSeasonInput>({
  type: 'object',
  $async: true,
  required: ['year', 'start', 'end'],

  properties: {
    year: {
      type: 'integer',
      minimum: YEAR_MIN,
      maximum: YEAR_MAX,
      yearIsAvailable: true,

      errorMessage: {
        type: SEASON_MESSAGES.YEAR_TYPE,
        minimum: SEASON_MESSAGES.YEAR_MIN,
        maximum: SEASON_MESSAGES.YEAR_MAX,
        yearIsAvailable: SEASON_MESSAGES.YEAR_IN_USE,
      },
    },

    start: {
      type: 'string',
      format: 'date-time',

      errorMessage: {
        type: SEASON_MESSAGES.START_TYPE,
        format: SEASON_MESSAGES.START_FORMAT,
      },
    },

    end: {
      type: 'string',
      format: 'date-time',

      errorMessage: {
        type: SEASON_MESSAGES.END_TYPE,
        format: SEASON_MESSAGES.END_FORMAT,
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
    required: {
      year: SEASON_MESSAGES.YEAR_REQUIRED,
      start: SEASON_MESSAGES.START_REQUIRED,
      end: SEASON_MESSAGES.END_REQUIRED,
    },
  },
});

// Update Schema
const updateSeasonSchema = ajv.compile<UpdateSeasonInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      seasonExists: true,

      errorMessage: {
        type: SEASON_MESSAGES.ID_TYPE,
        seasonExists: SEASON_MESSAGES.NOT_FOUND,
      },
    },

    year: {
      type: 'integer',
      minimum: YEAR_MIN,
      maximum: YEAR_MAX,
      yearIsAvailable: true,

      errorMessage: {
        type: SEASON_MESSAGES.YEAR_TYPE,
        minimum: SEASON_MESSAGES.YEAR_MIN,
        maximum: SEASON_MESSAGES.YEAR_MAX,
        yearIsAvailable: SEASON_MESSAGES.YEAR_IN_USE,
      },
    },

    start: {
      type: 'string',
      format: 'date-time',

      errorMessage: {
        type: SEASON_MESSAGES.START_TYPE,
        format: SEASON_MESSAGES.START_FORMAT,
      },
    },

    end: {
      type: 'string',
      format: 'date-time',

      errorMessage: {
        type: SEASON_MESSAGES.END_TYPE,
        format: SEASON_MESSAGES.END_FORMAT,
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
    required: {
      id: SEASON_MESSAGES.ID_REQUIRED,
    },
  },
});

// Get Schema
const getSeasonSchema = ajv.compile<GetSeasonInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      seasonExists: true,

      errorMessage: {
        type: SEASON_MESSAGES.ID_TYPE,
        seasonExists: SEASON_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: SEASON_MESSAGES.OBJECT_TYPE,
    required: {
      id: SEASON_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createSeasonSchema,
  updateSeasonSchema,
  getSeasonSchema,
  SEASON_MESSAGES,
  seasonExists,
};
