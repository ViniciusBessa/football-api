import { Router } from 'express';
import {
  createMatch,
  deleteMatch,
  getAllMatches,
  getSpecificMatch,
  updateMatch,
} from '../controllers/matches';
import { loginRequiredMiddleware } from '../middlewares/login-required';
import { restrictAccessMiddleware } from '../middlewares/restrict-access';
import {
  getAllMatchGoals,
  createMatchGoal,
  getSpecificMatchGoal,
  updateMatchGoal,
  deleteMatchGoal,
} from '../controllers/match-goals';

const router: Router = Router();

router
  .route('/')
  .get(getAllMatches)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createMatch);

router
  .route('/:matchId')
  .get(getSpecificMatch)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateMatch)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteMatch);

router
  .route('/:matchId/goals')
  .get(getAllMatchGoals)
  .post(loginRequiredMiddleware, restrictAccessMiddleware, createMatchGoal);

router
  .route('/:matchId/goals/:goalId')
  .get(getSpecificMatchGoal)
  .patch(loginRequiredMiddleware, restrictAccessMiddleware, updateMatchGoal)
  .delete(loginRequiredMiddleware, restrictAccessMiddleware, deleteMatchGoal);

export default router;
