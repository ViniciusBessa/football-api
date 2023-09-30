import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createTrophySchema,
  getTrophySchema,
  updateTrophySchema,
} from '../utils/ajv-validations/trophies-validations';

const prisma = new PrismaClient();

const getAllTrophies = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all trophies in the database
    const trophies = await prisma.trophy.findMany();
    return res.status(StatusCodes.OK).json({ trophies });
  }
);

const getSpecificTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTrophySchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the trophy and responding
    const trophy = await prisma.trophy.findFirst({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ trophy });
  }
);

const createTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { competitionId, seasonId, teamId } = req.body;

    // Validating the data passed through the request
    try {
      await createTrophySchema({ competitionId, seasonId, teamId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the trophy and responding
    const trophy = await prisma.trophy.create({
      data: { competitionId, seasonId, teamId },
    });
    return res.status(StatusCodes.CREATED).json({ trophy });
  }
);

const updateTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { competitionId, seasonId, teamId } = req.body;

    // Validating the data passed through the request
    try {
      await updateTrophySchema({ id, competitionId, seasonId, teamId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the trophy and responding
    const trophy = await prisma.trophy.update({
      where: { id: Number(id) },
      data: { competitionId, seasonId, teamId },
    });
    return res.status(StatusCodes.OK).json({ trophy });
  }
);

const deleteTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTrophySchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the trophy from the database and responding
    const trophy = await prisma.trophy.delete({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ trophy });
  }
);

export {
  getAllTrophies,
  getSpecificTrophy,
  createTrophy,
  updateTrophy,
  deleteTrophy,
};
