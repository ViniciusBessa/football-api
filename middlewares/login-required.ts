import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors';
import asyncWrapper from './async-wrapper';

const loginRequiredMiddleware = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError(
        "It's necessary to login to see this content"
      );
    }
    return next();
  }
);

export default loginRequiredMiddleware;
