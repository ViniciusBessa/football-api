import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllTeams = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteTeam = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
