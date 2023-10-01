import { Router } from 'express';
import {
  createTeam,
  deleteTeam,
  getAllTeams,
  getSpecificTeam,
  updateTeam,
} from '../controllers/teams';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';

const router: Router = Router();

router
  .route('/')
  .get(getAllTeams)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createTeam);

router
  .route('/:teamId')
  .get(getSpecificTeam)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateTeam)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteTeam);

export default router;
