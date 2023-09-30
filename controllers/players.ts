import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createPlayerSchema,
  getPlayerSchema,
  updatePlayerSchema,
} from '../utils/ajv-validations/players-validations';

const prisma = new PrismaClient();

const getAllPlayers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all players in the database
    const players = await prisma.player.findMany();
    return res.status(StatusCodes.OK).json({ players });
  }
);

const getSpecificPlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getPlayerSchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the player and responding
    const player = await prisma.player.findFirst({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ player });
  }
);

const createPlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      dateOfBirth,
      height,
      weight,
      positionId,
      countryId,
      currentTeamId,
    } = req.body;

    // Validating the data passed through the request
    try {
      await createPlayerSchema({
        name,
        dateOfBirth,
        height,
        weight,
        positionId,
        countryId,
        currentTeamId,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the player and responding
    const player = await prisma.player.create({
      data: {
        name,
        dateOfBirth,
        height,
        weight,
        positionId,
        countryId,
        currentTeamId,
      },
    });
    return res.status(StatusCodes.CREATED).json({ player });
  }
);

const updatePlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      name,
      dateOfBirth,
      height,
      weight,
      positionId,
      countryId,
      currentTeamId,
    } = req.body;

    // Validating the data passed through the request
    try {
      await updatePlayerSchema({
        id,
        name,
        dateOfBirth,
        height,
        weight,
        positionId,
        countryId,
        currentTeamId,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the player and responding
    const player = await prisma.player.update({
      where: { id: Number(id) },
      data: {
        name,
        dateOfBirth,
        height,
        weight,
        positionId,
        countryId,
        currentTeamId,
      },
    });
    return res.status(StatusCodes.OK).json({ player });
  }
);

const deletePlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getPlayerSchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the player from the database and responding
    const player = await prisma.player.delete({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ player });
  }
);

export {
  getAllPlayers,
  getSpecificPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
