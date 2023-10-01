import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createMatchSchema,
  getMatchSchema,
  updateMatchSchema,
} from '../utils/ajv-validations/matches-validations';

const prisma = new PrismaClient();

const getAllMatches = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all matches in the database
    const matches = await prisma.match.findMany();
    return res.status(StatusCodes.OK).json({ matches });
  }
);

const getSpecificMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { matchId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getMatchSchema({ id: matchId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the match and responding
    const match = await prisma.match.findFirst({
      where: { id: Number(matchId) },
    });
    return res.status(StatusCodes.OK).json({ match });
  }
);

const createMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { homeTeamId, awayTeamId, competitionId, seasonId } = req.body;

    // Validating the data passed through the request
    try {
      await createMatchSchema({
        homeTeamId,
        awayTeamId,
        competitionId,
        seasonId,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the match and responding
    const match = await prisma.match.create({
      data: { homeTeamId, awayTeamId, competitionId, seasonId },
    });
    return res.status(StatusCodes.CREATED).json({ match });
  }
);

const updateMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { matchId } = req.params;
    const { homeTeamId, awayTeamId, competitionId, seasonId } = req.body;

    // Validating the data passed through the request
    try {
      await updateMatchSchema({
        id: matchId,
        homeTeamId,
        awayTeamId,
        competitionId,
        seasonId,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the match and responding
    const match = await prisma.match.update({
      where: { id: Number(matchId) },
      data: { homeTeamId, awayTeamId, competitionId, seasonId },
    });
    return res.status(StatusCodes.OK).json({ match });
  }
);

const deleteMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { matchId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getMatchSchema({ id: matchId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the match from the database and responding
    const match = await prisma.match.delete({
      where: { id: Number(matchId) },
    });
    return res.status(StatusCodes.OK).json({ match });
  }
);

export {
  getAllMatches,
  getSpecificMatch,
  createMatch,
  updateMatch,
  deleteMatch,
};
