import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllSeasons = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteSeason = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
