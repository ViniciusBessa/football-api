import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllTransfers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
