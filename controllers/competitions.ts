import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createCompetitionSchema,
  getCompetitionSchema,
  updateCompetitionSchema,
} from '../utils/ajv-validations/competitions-validations';

const prisma = new PrismaClient();

const getAllCompetitions = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all competitions in the database
    const competitions = await prisma.competition.findMany();
    return res.status(StatusCodes.OK).json({ competitions });
  }
);

const getSpecificCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getCompetitionSchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the competition and responding
    const competition = await prisma.competition.findFirst({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ competition });
  }
);

const createCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, code, logoUrl, type } = req.body;

    // Validating the data passed through the request
    try {
      await createCompetitionSchema({ name, code, logoUrl, type });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the competition and responding
    const competition = await prisma.competition.create({
      data: { name, code, logoUrl, type },
    });
    return res.status(StatusCodes.CREATED).json({ competition });
  }
);

const updateCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, code, logoUrl, type } = req.body;

    // Validating the data passed through the request
    try {
      await updateCompetitionSchema({ id, name, code, logoUrl, type });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the competition and responding
    const competition = await prisma.competition.update({
      where: { id: Number(id) },
      data: { name, code, logoUrl, type },
    });
    return res.status(StatusCodes.OK).json({ competition });
  }
);

const deleteCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getCompetitionSchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the competition from the database and responding
    const competition = await prisma.competition.delete({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ competition });
  }
);

export {
  getAllCompetitions,
  getSpecificCompetition,
  createCompetition,
  updateCompetition,
  deleteCompetition,
};
