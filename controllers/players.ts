import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllPlayers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificPlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createPlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updatePlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deletePlayer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
