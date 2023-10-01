import { Router } from 'express';
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getSpecificPlayer,
  updatePlayer,
} from '../controllers/players';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllPlayers)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createPlayer);

router
  .route('/:playerId')
  .get(getSpecificPlayer)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updatePlayer)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deletePlayer);

export default router;
