import { Router } from 'express';
import {
  createTransfer,
  deleteTransfer,
  getAllTransfers,
  getSpecificTransfer,
  updateTransfer,
} from '../controllers/transfers';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllTransfers)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createTransfer);

router
  .route('/:transferId')
  .get(getSpecificTransfer)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateTransfer)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteTransfer);

export default router;
