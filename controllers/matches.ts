import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllMatches = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteMatch = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
