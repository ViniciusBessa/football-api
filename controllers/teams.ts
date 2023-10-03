import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createTeamSchema,
  getTeamSchema,
  updateTeamSchema,
} from '../utils/ajv-validations/teams-validations';

const prisma = new PrismaClient();

const getAllTeams = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all teams in the database
    const teams = await prisma.team.findMany();
    return res.status(StatusCodes.OK).json({ teams });
  }
);

const getSpecificTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { teamId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTeamSchema({ id: teamId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the team and responding
    const team = await prisma.team.findFirst({
      where: { id: Number(teamId) },
    });
    return res.status(StatusCodes.OK).json({ team });
  }
);

const createTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, code, foundingDate, logoUrl, isNational, countryId } =
      req.body;

    // Validating the data passed through the request
    try {
      await createTeamSchema({
        name,
        code,
        foundingDate,
        logoUrl,
        isNational,
        countryId,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the team and responding
    const team = await prisma.team.create({
      data: { name, code, foundingDate, logoUrl, isNational, countryId },
    });
    return res.status(StatusCodes.CREATED).json({ team });
  }
);

const updateTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { teamId } = req.params;
    const { name, code, foundingDate, logoUrl, isNational, countryId } =
      req.body;

    // Validating the data passed through the request
    try {
      await updateTeamSchema({
        id: teamId,
        name,
        code,
        foundingDate,
        logoUrl,
        isNational,
        countryId,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the team and responding
    const team = await prisma.team.update({
      where: { id: Number(teamId) },
      data: { name, code, foundingDate, logoUrl, isNational, countryId },
    });
    return res.status(StatusCodes.OK).json({ team });
  }
);

const deleteTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { teamId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTeamSchema({ id: teamId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the team from the database and responding
    const team = await prisma.team.delete({
      where: { id: Number(teamId) },
    });
    return res.status(StatusCodes.OK).json({ team });
  }
);

export { getAllTeams, getSpecificTeam, createTeam, updateTeam, deleteTeam };
