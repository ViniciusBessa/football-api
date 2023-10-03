import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { TROPHY_MESSAGES } from '../utils/ajv-validations/trophies-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Trophy Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/trophies should return all trophy in the database', async () => {
      const response = await request
        .get('/api/v1/trophies')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophies.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/trophies/:trophyId should fail to return a trophy by not found', async () => {
      const response = await request
        .get('/api/v1/trophies/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/trophies/:trophyId should return a trophy', async () => {
      const response = await request
        .get('/api/v1/trophies/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophy).toBeTruthy();
    });

    it('POST /api/v1/trophies should fail to create a trophy by missing the competition id', async () => {
      const response = await request
        .post('/api/v1/trophies')
        .send({ seasonId: 1, teamId: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        TROPHY_MESSAGES.COMPETITION_ID_REQUIRED
      );
    });

    it('POST /api/v1/trophies should fail to create a trophy by competition not found', async () => {
      const response = await request
        .post('/api/v1/trophies')
        .send({ competitionId: 15, seasonId: 1, teamId: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.COMPETITION_NOT_FOUND);
    });

    it('POST /api/v1/trophies should fail to create a trophy by missing the season id', async () => {
      const response = await request
        .post('/api/v1/trophies')
        .send({ competitionId: 1, teamId: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.SEASON_ID_REQUIRED);
    });

    it('POST /api/v1/trophies should fail to create a trophy by season not found', async () => {
      const response = await request
        .post('/api/v1/trophies')
        .send({ competitionId: 1, seasonId: 15, teamId: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.SEASON_NOT_FOUND);
    });

    it('POST /api/v1/trophies should fail to create a trophy by missing the team id', async () => {
      const response = await request
        .post('/api/v1/trophies')
        .send({ competitionId: 1, seasonId: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.TEAM_ID_REQUIRED);
    });

    it('POST /api/v1/trophies should fail to create a trophy by team not found', async () => {
      const response = await request
        .post('/api/v1/trophies')
        .send({ competitionId: 1, seasonId: 1, teamId: 15 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.TEAM_NOT_FOUND);
    });

    it('POST /api/v1/trophies should successfully create a trophy', async () => {
      const competitionId = 1;
      const seasonId = 1;
      const teamId = 1;

      const response = await request
        .post('/api/v1/trophies')
        .send({ competitionId, seasonId, teamId })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.trophy).toBeTruthy();
      expect(response.body.trophy.competitionId).toEqual(competitionId);
      expect(response.body.trophy.seasonId).toEqual(seasonId);
      expect(response.body.trophy.teamId).toEqual(teamId);
    });

    it('PATCH /api/v1/trophies/:trophyId should fail to update a trophy by not found', async () => {
      const response = await request
        .patch('/api/v1/trophies/14')
        .send({ competitionId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/trophies/:trophyId should fail to update a trophy by competition not found', async () => {
      const response = await request
        .patch('/api/v1/trophies/3')
        .send({ competitionId: 15 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.COMPETITION_NOT_FOUND);
    });

    it('PATCH /api/v1/trophies/:trophyId should fail to update a trophy by season not found', async () => {
      const response = await request
        .patch('/api/v1/trophies/3')
        .send({ seasonId: 15 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.SEASON_NOT_FOUND);
    });

    it('PATCH /api/v1/trophies/:trophyId should fail to update a trophy by team not found', async () => {
      const response = await request
        .patch('/api/v1/trophies/3')
        .send({ teamId: 15 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.TEAM_NOT_FOUND);
    });

    it('PATCH /api/v1/trophies/:trophyId should successfully update the trophy', async () => {
      const newCompetitionId = 1;
      const newSeasonId = 1;
      const newTeamId = 2;

      const response = await request
        .patch('/api/v1/trophies/3')
        .send({
          competitionId: newCompetitionId,
          seasonId: newSeasonId,
          teamId: newTeamId,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophy).toBeTruthy();
      expect(response.body.trophy.competitionId).toEqual(newCompetitionId);
      expect(response.body.trophy.seasonId).toEqual(newSeasonId);
      expect(response.body.trophy.teamId).toEqual(newTeamId);
    });

    it('DELETE /api/v1/trophies/:trophyId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/trophies/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/trophies/:trophyId should successfully delete a trophy', async () => {
      const response = await request
        .delete('/api/v1/trophies/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophy).toBeTruthy();
      expect(response.body.trophy.id).toEqual(4);
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

    it('GET /api/v1/trophies should return all trophy in the database', async () => {
      const response = await request
        .get('/api/v1/trophies')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophies.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/trophies/:trophyId should fail to return a trophy by not found', async () => {
      const response = await request
        .get('/api/v1/trophies/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/trophies/:trophyId should return a trophy', async () => {
      const response = await request
        .get('/api/v1/trophies/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophy).toBeTruthy();
    });

    it('POST /api/v1/trophies should fail to create a trophy by forbidden', async () => {
      const response = await request
        .post('/api/v1/trophies')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/trophies/:trophyId should fail to update a trophy by forbidden', async () => {
      const response = await request
        .patch('/api/v1/trophies/14')
        .send({ name: 'NewTrophy' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/trophies/:trophyId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/trophies/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/trophies should return all trophy in the database', async () => {
      const response = await request.get('/api/v1/trophies');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophies.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/trophies/:trophyId should fail to return a trophy by not found', async () => {
      const response = await request.get('/api/v1/trophies/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TROPHY_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/trophies/:trophyId should return a trophy', async () => {
      const response = await request.get('/api/v1/trophies/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.trophy).toBeTruthy();
    });

    it('POST /api/v1/trophies should fail to create a trophy by unauthorized', async () => {
      const response = await request.post('/api/v1/trophies').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/trophies/:trophyId should fail to update a trophy by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/trophies/14')
        .send({ name: 'NewTrophy' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/trophies/:trophyId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/trophies/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
