import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllTrophies = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteTrophy = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
