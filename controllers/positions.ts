import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createPositionSchema,
  getPositionSchema,
  updatePositionSchema,
} from '../utils/ajv-validations/positions-validations';

const prisma = new PrismaClient();

const getAllPositions = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all positions in the database
    const positions = await prisma.position.findMany();
    return res.status(StatusCodes.OK).json({ positions });
  }
);

const getSpecificPosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getPositionSchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the position and responding
    const position = await prisma.position.findFirst({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ position });
  }
);

const createPosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    // Validating the data passed through the request
    try {
      await createPositionSchema({ name });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the position and responding
    const position = await prisma.position.create({
      data: { name },
    });
    return res.status(StatusCodes.CREATED).json({ position });
  }
);

const updatePosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name } = req.body;

    // Validating the data passed through the request
    try {
      await updatePositionSchema({ id, name });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the position and responding
    const position = await prisma.position.update({
      where: { id: Number(id) },
      data: { name },
    });
    return res.status(StatusCodes.OK).json({ position });
  }
);

const deletePosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getPositionSchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the position from the database and responding
    const position = await prisma.position.delete({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ position });
  }
);

export {
  getAllPositions,
  getSpecificPosition,
  createPosition,
  updatePosition,
  deletePosition,
};
