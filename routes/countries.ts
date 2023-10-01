import { Router } from 'express';
import {
  createCountry,
  deleteCountry,
  getAllCountries,
  getSpecificCountry,
  updateCountry,
} from '../controllers/countries';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllCountries)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createCountry);

router
  .route('/:countryId')
  .get(getSpecificCountry)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateCountry)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteCountry);

export default router;
