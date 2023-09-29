import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllCompetitions = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteCompetition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
