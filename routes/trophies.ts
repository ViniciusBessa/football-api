import { Router } from 'express';
import {
  createTrophy,
  deleteTrophy,
  getAllTrophies,
  getSpecificTrophy,
  updateTrophy,
} from '../controllers/trophies';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllTrophies)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createTrophy);

router
  .route('/:trophyId')
  .get(getSpecificTrophy)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateTrophy)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteTrophy);

export default router;
