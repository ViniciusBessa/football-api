import { Router } from 'express';
import {
  createCompetition,
  deleteCompetition,
  getAllCompetitions,
  getSpecificCompetition,
  updateCompetition,
} from '../controllers/competitions';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllCompetitions)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createCompetition);

router
  .route('/:competitionId')
  .get(getSpecificCompetition)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateCompetition)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteCompetition);

export default router;
