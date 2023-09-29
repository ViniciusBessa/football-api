import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(StatusCodes.NOT_FOUND).json({ err: 'Page not found' });
};

export default notFoundMiddleware;
