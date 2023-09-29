import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllPositions = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificPosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createPosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updatePosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deletePosition = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
