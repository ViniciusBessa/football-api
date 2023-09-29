import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors';
import asyncWrapper from './async-wrapper';

const restrictAccessMiddleware = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenError(
        "You don't have the permission to access this content"
      );
    }
    return next();
  }
);

export default restrictAccessMiddleware;
