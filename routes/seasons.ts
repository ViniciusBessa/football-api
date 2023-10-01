import { Router } from 'express';
import {
  createSeason,
  deleteSeason,
  getAllSeasons,
  getSpecificSeason,
  updateSeason,
} from '../controllers/seasons';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllSeasons)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createSeason);

router
  .route('/:seasonId')
  .get(getSpecificSeason)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateSeason)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteSeason);

export default router;
