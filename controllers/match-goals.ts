import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createMatchGoalSchema,
  getMatchGoalSchema,
  updateMatchGoalSchema,
} from '../utils/ajv-validations/match-goals-validations';

const prisma = new PrismaClient();

const getAllMatchGoals = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { matchId } = req.params;

    // Getting all match goals in the database
    const matchGoals = await prisma.matchGoals.findMany({
      where: { matchId: Number(matchId) },
    });
    return res.status(StatusCodes.OK).json({ matchGoals });
  }
);

const getSpecificMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { goalId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getMatchGoalSchema({ id: goalId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the match goal and responding
    const matchGoal = await prisma.matchGoals.findFirst({
      where: { id: Number(goalId) },
    });
    return res.status(StatusCodes.OK).json({ matchGoal });
  }
);

const createMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { matchId } = req.params;
    const { teamId, goalscorerId, assistantId, isOwnGoal, goalTimestamp } =
      req.body;

    // Validating the data passed through the request
    try {
      await createMatchGoalSchema({
        matchId,
        teamId,
        goalscorerId,
        assistantId,
        isOwnGoal,
        goalTimestamp,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the match goal and responding
    const matchGoal = await prisma.matchGoals.create({
      data: {
        matchId: Number(matchId),
        teamId,
        goalscorerId,
        assistantId,
        isOwnGoal,
        goalTimestamp,
      },
    });
    return res.status(StatusCodes.CREATED).json({ matchGoal });
  }
);

const updateMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { matchId, goalId } = req.params;
    const { teamId, goalscorerId, assistantId, isOwnGoal, goalTimestamp } =
      req.body;

    // Validating the data passed through the request
    try {
      await updateMatchGoalSchema({
        id: goalId,
        matchId,
        teamId,
        goalscorerId,
        assistantId,
        isOwnGoal,
        goalTimestamp,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the match goal and responding
    const matchGoal = await prisma.matchGoals.update({
      where: { id: Number(goalId) },
      data: {
        teamId,
        goalscorerId,
        assistantId,
        isOwnGoal,
        goalTimestamp,
      },
    });
    return res.status(StatusCodes.OK).json({ matchGoal });
  }
);

const deleteMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { goalId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getMatchGoalSchema({ id: goalId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the matchgoal from the database and responding
    const matchGoal = await prisma.matchGoals.delete({
      where: { id: Number(goalId) },
    });
    return res.status(StatusCodes.OK).json({ matchGoal });
  }
);

export {
  getAllMatchGoals,
  getSpecificMatchGoal,
  createMatchGoal,
  updateMatchGoal,
  deleteMatchGoal,
};
