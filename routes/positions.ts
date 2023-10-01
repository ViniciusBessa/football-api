import { Router } from 'express';
import {
  createPosition,
  deletePosition,
  getAllPositions,
  getSpecificPosition,
  updatePosition,
} from '../controllers/positions';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllPositions)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createPosition);

router
  .route('/:positionId')
  .get(getSpecificPosition)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updatePosition)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deletePosition);

export default router;
