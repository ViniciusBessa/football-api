import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import {
  LoginUserInput,
  RegisterUserInput,
  UpdateUserInput,
} from '../../types/auth-input';
import { EMAIL_REGEX } from '../email-regex';
import { PrismaClient } from '@prisma/client';

// Field constraints
const USERNAME_MIN_LENGTH = 8;
const USERNAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 10;

// Error messages
const USER_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  NAME_REQUIRED: 'Please, provide an username',
  NAME_TYPE: 'The name must be a string',
  NAME_MIN: `The username must be at least ${USERNAME_MIN_LENGTH} characters long`,
  NAME_MAX: `The maximum number of characters for the username is ${USERNAME_MAX_LENGTH}`,
  NAME_IN_USE: 'This username is already in use',
  EMAIL_REQUIRED: 'Please, provide an email',
  EMAIL_TYPE: 'The email must be a string',
  EMAIL_INVALID: 'The email provided is invalid',
  EMAIL_IN_USE: 'This email is already in use',
  PASSWORD_REQUIRED: 'Please, provide a password',
  PASSWORD_TYPE: 'The password must be a string',
  PASSWORD_MIN: `The password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  PASSWORD_INCORRECT: 'The password is incorrect',
  NOT_FOUND: 'No user was found with the provided email',
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
  keyword: 'emailIsAvailable',
  async: true,
  type: 'string',
  schema: false,
  validate: emailIsAvailable,
});

ajv.addKeyword({
  keyword: 'userExists',
  async: true,
  type: 'string',
  schema: false,
  validate: userExists,
});

async function nameIsAvailable(name: string): Promise<boolean> {
  const users = await prisma.user.findMany({ where: { name } });
  return users.length === 0;
}

async function emailIsAvailable(email: string): Promise<boolean> {
  const users = await prisma.user.findMany({ where: { email } });
  return users.length === 0;
}

async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findFirst({ where: { email } });
  return !!user;
}

// Auth Schemas
const registerUserSchema = ajv.compile<RegisterUserInput>({
  $async: true,
  type: 'object',

  allOf: [
    {
      required: ['name', 'email', 'password'],
      errorMessage: {
        required: {
          name: USER_MESSAGES.NAME_REQUIRED,
          email: USER_MESSAGES.EMAIL_REQUIRED,
          password: USER_MESSAGES.PASSWORD_REQUIRED,
        },
      },
    },
  ],

  properties: {
    name: {
      type: 'string',
      minLength: USERNAME_MIN_LENGTH,
      maxLength: USERNAME_MAX_LENGTH,
      nameIsAvailable: true,
      errorMessage: {
        type: USER_MESSAGES.NAME_TYPE,
        minLength: USER_MESSAGES.NAME_MIN,
        maxLength: USER_MESSAGES.NAME_MAX,
        nameIsAvailable: USER_MESSAGES.NAME_IN_USE,
      },
    },

    email: {
      type: 'string',
      pattern: EMAIL_REGEX,
      emailIsAvailable: true,
      errorMessage: {
        type: USER_MESSAGES.EMAIL_TYPE,
        pattern: USER_MESSAGES.EMAIL_INVALID,
        emailIsAvailable: USER_MESSAGES.EMAIL_IN_USE,
      },
    },

    password: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      errorMessage: {
        type: USER_MESSAGES.PASSWORD_TYPE,
        minLength: USER_MESSAGES.PASSWORD_MIN,
      },
    },
  },

  errorMessage: {
    type: USER_MESSAGES.OBJECT_TYPE,
  },
});

const loginUserSchema = ajv.compile<LoginUserInput>({
  $async: true,
  type: 'object',

  allOf: [
    {
      required: ['email', 'password'],
      errorMessage: {
        required: {
          email: USER_MESSAGES.EMAIL_REQUIRED,
          password: USER_MESSAGES.PASSWORD_REQUIRED,
        },
      },
    },
  ],

  properties: {
    email: {
      type: 'string',
      pattern: EMAIL_REGEX,
      userExists: true,
      errorMessage: {
        type: USER_MESSAGES.EMAIL_TYPE,
        pattern: USER_MESSAGES.EMAIL_INVALID,
        userExists: USER_MESSAGES.NOT_FOUND,
      },
    },

    password: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      errorMessage: {
        type: USER_MESSAGES.PASSWORD_TYPE,
        minLength: USER_MESSAGES.PASSWORD_MIN,
      },
    },
  },

  errorMessage: {
    type: USER_MESSAGES.OBJECT_TYPE,
  },
});

export { registerUserSchema, loginUserSchema, USER_MESSAGES };
