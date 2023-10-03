import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { MATCH_GOAL_MESSAGES } from '../utils/ajv-validations/match-goals-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Match Goal Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/matches/1/goals should return all goals in the database', async () => {
      const response = await request
        .get('/api/v1/matches/1/goals')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoals.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/matches/1/goals/:goalId should fail to return a goal by not found', async () => {
      const response = await request
        .get('/api/v1/matches/1/goals/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/matches/1/goals/:goalId should return a goal', async () => {
      const response = await request
        .get('/api/v1/matches/1/goals/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoal).toBeTruthy();
    });

    it('POST /api/v1/matches/15/goals should fail to create a goal by match not found', async () => {
      const response = await request
        .post('/api/v1/matches/15/goals')
        .send({
          teamId: 1,
          goalscorerId: 1,
          isOwnGoal: true,
          goalTimestamp: new Date('2015-04-23'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.MATCH_NOT_FOUND);
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by missing the team id', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          goalscorerId: 1,
          isOwnGoal: true,
          goalTimestamp: new Date('2015-04-23'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.TEAM_ID_REQUIRED);
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by team not found', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          teamId: 15,
          goalscorerId: 1,
          isOwnGoal: true,
          goalTimestamp: new Date('2015-04-23'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.TEAM_NOT_FOUND);
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by missing the goalscorer id', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          teamId: 1,
          isOwnGoal: true,
          goalTimestamp: new Date('2015-04-23'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.GOALSCORER_ID_REQUIRED
      );
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by goalscorer not found', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          teamId: 1,
          goalscorerId: 16,
          isOwnGoal: true,
          goalTimestamp: new Date('2015-04-23'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.GOALSCORER_NOT_FOUND
      );
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by assistant not found', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          teamId: 1,
          goalscorerId: 1,
          assistantId: 16,
          isOwnGoal: true,
          goalTimestamp: new Date('2015-04-23'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.ASSISTANT_NOT_FOUND
      );
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by missing the own goal property', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          teamId: 1,
          goalscorerId: 1,
          goalTimestamp: new Date('2015-04-23'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.OWN_GOAL_REQUIRED);
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by missing the timestamp', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          teamId: 1,
          goalscorerId: 1,
          isOwnGoal: true,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.GOAL_TIMESTAMP_REQUIRED
      );
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by wrong timestamp format', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({
          teamId: 1,
          goalscorerId: 1,
          isOwnGoal: true,
          goalTimestamp: '123',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.GOAL_TIMESTAMP_FORMAT
      );
    });

    it('POST /api/v1/matches/1/goals should successfully create a goal', async () => {
      const teamId = 1;
      const goalscorerId = 1;
      const assistantId = 2;
      const isOwnGoal = false;
      const goalTimestamp = new Date('2018-01-01');

      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({ teamId, goalscorerId, assistantId, isOwnGoal, goalTimestamp })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.matchGoal).toBeTruthy();
      expect(response.body.matchGoal.teamId).toEqual(teamId);
      expect(response.body.matchGoal.goalscorerId).toEqual(goalscorerId);
      expect(response.body.matchGoal.assistantId).toEqual(assistantId);
      expect(response.body.matchGoal.isOwnGoal).toEqual(isOwnGoal);
      expect(response.body.matchGoal.goalTimestamp).toEqual(
        goalTimestamp.toISOString()
      );
    });

    it('PATCH /api/v1/matches/1/goals/:goalId should fail to update a goal by not found', async () => {
      const response = await request
        .patch('/api/v1/matches/1/goals/14')
        .send({ teamId: 3 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/matches/15/goals/:goalId should fail to update a goal by match not found', async () => {
      const response = await request
        .patch('/api/v1/matches/15/goals/3')
        .send({
          teamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.MATCH_NOT_FOUND);
    });

    it('PATCH /api/v1/matches/1/goals/:goalId should fail to update a goal by team not found', async () => {
      const response = await request
        .patch('/api/v1/matches/1/goals/3')
        .send({
          teamId: 15,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.TEAM_NOT_FOUND);
    });

    it('PATCH /api/v1/matches/1/goals/:goalId should fail to update a goal by goalscorer not found', async () => {
      const response = await request
        .patch('/api/v1/matches/1/goals/3')
        .send({
          goalscorerId: 16,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.GOALSCORER_NOT_FOUND
      );
    });

    it('PATCH /api/v1/matches/1/goals/:goalId should fail to update a goal by assistant not found', async () => {
      const response = await request
        .patch('/api/v1/matches/1/goals/3')
        .send({
          assistantId: 16,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.ASSISTANT_NOT_FOUND
      );
    });

    it('PATCH /api/v1/matches/1/goals/:goald should fail to update a goal by wrong timestamp format', async () => {
      const response = await request
        .patch('/api/v1/matches/1/goals/3')
        .send({
          goalTimestamp: '123',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        MATCH_GOAL_MESSAGES.GOAL_TIMESTAMP_FORMAT
      );
    });

    it('PATCH /api/v1/matches/1/goals/:goalId should successfully update the goal', async () => {
      const newTeamId = 1;
      const newGoalscorerId = 1;
      const newAssistantId = 2;
      const newIsOwnGoal = false;
      const newGoalTimestamp = new Date('2018-01-01');

      const response = await request
        .patch('/api/v1/matches/1/goals/3')
        .send({
          teamId: newTeamId,
          goalscorerId: newGoalscorerId,
          assistantId: newAssistantId,
          isOwnGoal: newIsOwnGoal,
          goalTimestamp: newGoalTimestamp,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoal).toBeTruthy();
      expect(response.body.matchGoal.teamId).toEqual(newTeamId);
      expect(response.body.matchGoal.goalscorerId).toEqual(newGoalscorerId);
      expect(response.body.matchGoal.assistantId).toEqual(newAssistantId);
      expect(response.body.matchGoal.isOwnGoal).toEqual(newIsOwnGoal);
      expect(response.body.matchGoal.goalTimestamp).toEqual(
        newGoalTimestamp.toISOString()
      );
    });

    it('DELETE /api/v1/matches/1/goals/:goalId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/matches/1/goals/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/matches/1/goals/:goalId should successfully delete a goal', async () => {
      const response = await request
        .delete('/api/v1/matches/1/goals/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoal).toBeTruthy();
    });
  });

  describe('Logged in as User', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'taqqiq@gmail.com', password: 'taqqiqberlin' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/matches/1/goals should return all goals in the database', async () => {
      const response = await request
        .get('/api/v1/matches/1/goals')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoals.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/matches/1/goals/:goalId should fail to return a goal by not found', async () => {
      const response = await request
        .get('/api/v1/matches/1/goals/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/matches/1/goals/:goalId should return a goal', async () => {
      const response = await request
        .get('/api/v1/matches/1/goals/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoal).toBeTruthy();
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by forbidden', async () => {
      const response = await request
        .post('/api/v1/matches/1/goals')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/matches/1/goals/:goalId should fail to update a goal by forbidden', async () => {
      const response = await request
        .patch('/api/v1/matches/1/goals/14')
        .send({ name: 'NewMatchGoal' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/matches/1/goals/:goalId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/matches/1/goals/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/matches/1/goals should return all goals in the database', async () => {
      const response = await request.get('/api/v1/matches/1/goals');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoals.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/matches/1/goals/:goalId should fail to return a goal by not found', async () => {
      const response = await request.get('/api/v1/matches/1/goals/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_GOAL_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/matches/1/goals/:goalId should return a goal', async () => {
      const response = await request.get('/api/v1/matches/1/goals/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matchGoal).toBeTruthy();
    });

    it('POST /api/v1/matches/1/goals should fail to create a goal by unauthorized', async () => {
      const response = await request.post('/api/v1/matches/1/goals').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/matches/1/goals/:goalId should fail to update a goal by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/matches/1/goals/14')
        .send({ name: 'NewMatchGoal' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/matches/1/goals/:goalId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/matches/1/goals/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
