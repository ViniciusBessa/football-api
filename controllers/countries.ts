import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import {
  createCountrySchema,
  getCountrySchema,
  updateCountrySchema,
} from '../utils/ajv-validations/countries-validations';

const prisma = new PrismaClient();

const getAllCountries = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // Getting all countries in the database
    const countries = await prisma.country.findMany();
    return res.status(StatusCodes.OK).json({ countries });
  }
);

const getSpecificCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getCountrySchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Getting the country and responding
    const country = await prisma.country.findFirst({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ country });
  }
);

const createCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, code, flagUrl } = req.body;

    // Validating the data passed through the request
    try {
      await createCountrySchema({ name, code, flagUrl });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Creating the country and responding
    const country = await prisma.country.create({
      data: { name, code, flagUrl },
    });
    return res.status(StatusCodes.CREATED).json({ country });
  }
);

const updateCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, code, flagUrl } = req.body;

    // Validating the data passed through the request
    try {
      await updateCountrySchema({ id, name, code, flagUrl });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;

      if (errorMessage.includes('was found')) {
        throw new NotFoundError(errorMessage);
      }
      throw new BadRequestError(errorMessage);
    }

    // Updating the country and responding
    const country = await prisma.country.update({
      where: { id: Number(id) },
      data: { name, code, flagUrl },
    });
    return res.status(StatusCodes.OK).json({ country });
  }
);

const deleteCountry = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validating the id passed through the parameters
    try {
      await getCountrySchema({ id });
    } catch (error: any) {
      const errorMessage = error.errors[0].message as string;
      throw new NotFoundError(errorMessage);
    }

    // Deleting the country from the database and responding
    const country = await prisma.country.delete({
      where: { id: Number(id) },
    });
    return res.status(StatusCodes.OK).json({ country });
  }
);

export {
  getAllCountries,
  getSpecificCountry,
  createCountry,
  updateCountry,
  deleteCountry,
};
