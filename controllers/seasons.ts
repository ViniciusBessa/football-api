import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createSeasonSchema,
  getSeasonSchema,
  updateSeasonSchema,
} from '../utils/ajv-validations/seasons-validations';

const prisma = new PrismaClient();

const getAllSeasons = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all seasons in the database
    const seasons = await prisma.season.findMany();
    return res.status(StatusCodes.OK).json({ seasons });
  }
);

const getSpecificSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { seasonId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getSeasonSchema({ id: seasonId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the season and responding
    const season = await prisma.season.findFirst({
      where: { id: Number(seasonId) },
    });
    return res.status(StatusCodes.OK).json({ season });
  }
);

const createSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { year, start, end, isCurrent } = req.body;

    // Validating the data passed through the request
    try {
      await createSeasonSchema({ year, start, end, isCurrent });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the season and responding
    const season = await prisma.season.create({
      data: { year, start, end, isCurrent },
    });
    return res.status(StatusCodes.CREATED).json({ season });
  }
);

const updateSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { seasonId } = req.params;
    const { year, start, end, isCurrent } = req.body;

    // Validating the data passed through the request
    try {
      await updateSeasonSchema({ id: seasonId, year, start, end, isCurrent });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the season and responding
    const season = await prisma.season.update({
      where: { id: Number(seasonId) },
      data: { year, start, end, isCurrent },
    });
    return res.status(StatusCodes.OK).json({ season });
  }
);

const deleteSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { seasonId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getSeasonSchema({ id: seasonId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the season from the database and responding
    const season = await prisma.season.delete({
      where: { id: Number(seasonId) },
    });
    return res.status(StatusCodes.OK).json({ season });
  }
);

export {
  getAllSeasons,
  getSpecificSeason,
  createSeason,
  updateSeason,
  deleteSeason,
};
