import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createTransferSchema,
  getTransferSchema,
  updateTransferSchema,
} from '../utils/ajv-validations/transfers-validations';

const prisma = new PrismaClient();

const getAllTransfers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all transfers in the database
    const transfers = await prisma.transfer.findMany();
    return res.status(StatusCodes.OK).json({ transfers });
  }
);

const getSpecificTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transferId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTransferSchema({ id: transferId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the transfer and responding
    const transfer = await prisma.transfer.findFirst({
      where: { id: Number(transferId) },
    });
    return res.status(StatusCodes.OK).json({ transfer });
  }
);

const createTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { playerId, previousTeamId, newTeamId, fee, date } = req.body;

    // Validating the data passed through the request
    try {
      await createTransferSchema({
        playerId,
        previousTeamId,
        newTeamId,
        fee,
        date,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the transfer and responding
    const transfer = await prisma.transfer.create({
      data: { playerId, previousTeamId, newTeamId, fee, date },
    });
    return res.status(StatusCodes.CREATED).json({ transfer });
  }
);

const updateTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transferId } = req.params;
    const { playerId, previousTeamId, newTeamId, fee, date } = req.body;

    // Validating the data passed through the request
    try {
      await updateTransferSchema({
        id: transferId,
        playerId,
        previousTeamId,
        newTeamId,
        fee,
        date,
      });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the transfer and responding
    const transfer = await prisma.transfer.update({
      where: { id: Number(transferId) },
      data: { playerId, previousTeamId, newTeamId, fee, date },
    });
    return res.status(StatusCodes.OK).json({ transfer });
  }
);

const deleteTransfer = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transferId } = req.params;

    // Validating the id passed through the parameters
    try {
      await getTransferSchema({ id: transferId });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the transfer from the database and responding
    const transfer = await prisma.transfer.delete({
      where: { id: Number(transferId) },
    });
    return res.status(StatusCodes.OK).json({ transfer });
  }
);

export {
  getAllTransfers,
  getSpecificTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer,
};
