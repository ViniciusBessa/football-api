import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllcountries = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getSpecificCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const createCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const updateCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {}
);
