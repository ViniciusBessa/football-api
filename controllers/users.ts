import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';
import { comparePassword, encryptPassword } from '../utils/encryption';
import { createToken, getUserPayload } from '../utils/jwt';
import {
  USER_MESSAGES,
  deleteOwnUserSchema,
  getUserSchema,
  updateUserSchema,
} from '../utils/ajv-validations/auth-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';

const prisma = new PrismaClient();

const getAllUsers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(StatusCodes.OK).json({ users });
  }
);

const getSpecificUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      await getUserSchema({ id: userId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }
    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(StatusCodes.OK).json({ user });
  }
);

const updateUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { userId } = req.params;
    let { name, email, password } = req.body;

    if (user.id !== Number(userId)) {
      throw new ForbiddenError(FORBIDDEN_ERROR_MESSAGE);
    }

    // Validating the info submitted
    try {
      await updateUserSchema({ id: userId, name, email, password });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Encrypting the password if it was submitted
    if (password) {
      password = await encryptPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, email, password },
    });

    // Getting the user payload and generating a new token for authentication
    const userPayload = await getUserPayload(updatedUser);
    const newToken = await createToken(userPayload);

    return res
      .status(StatusCodes.OK)
      .json({ user: userPayload, token: newToken });
  }
);

const deleteAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      await getUserSchema({ id: userId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    const user = await prisma.user.delete({
      where: { id: Number(userId) },
    });

    const userPayload = await getUserPayload(user);
    return res.status(StatusCodes.OK).json({ user: userPayload });
  }
);

const deleteOwnAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { password } = req.body;

    try {
      await deleteOwnUserSchema({ id: user.id.toString(), password });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    const userAccount = (await prisma.user.findFirst({
      where: { id: user.id },
    }))!;

    // Comparing the password submitted by the user to the one in the database
    const passwordMatches = await comparePassword(
      userAccount.password,
      password
    );

    if (!passwordMatches) {
      throw new BadRequestError(USER_MESSAGES.PASSWORD_INCORRECT);
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    const userPayload = await getUserPayload(user);
    return res.status(StatusCodes.OK).json({ user: userPayload });
  }
);

export {
  getAllUsers,
  getSpecificUser,
  updateUser,
  deleteAccount,
  deleteOwnAccount,
};
