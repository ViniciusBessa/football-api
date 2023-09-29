import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllMatchGoals = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteMatchGoal = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
