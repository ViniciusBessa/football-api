import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { MATCH_MESSAGES } from '../utils/ajv-validations/matches-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Match Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/matches should return all match in the database', async () => {
      const response = await request
        .get('/api/v1/matches')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matches.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/matches/:matchId should fail to return a match by not found', async () => {
      const response = await request
        .get('/api/v1/matches/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/matches/:matchId should return a match', async () => {
      const response = await request
        .get('/api/v1/matches/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.match).toBeTruthy();
    });

    it('POST /api/v1/matches should fail to create a match by missing the competition id', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ seasonId: 1, homeTeamId: 1, awayTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(MATCH_MESSAGES.COMPETITION_ID_REQUIRED);
    });

    it('POST /api/v1/matches should fail to create a match by competition not found', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId: 15, seasonId: 1, homeTeamId: 1, awayTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.COMPETITION_NOT_FOUND);
    });

    it('POST /api/v1/matches should fail to create a match by missing the season id', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId: 1, homeTeamId: 1, awayTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(MATCH_MESSAGES.SEASON_ID_REQUIRED);
    });

    it('POST /api/v1/matches should fail to create a match by season not found', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId: 1, seasonId: 16, homeTeamId: 1, awayTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.SEASON_NOT_FOUND);
    });

    it('POST /api/v1/matches should fail to create a match by missing the home team id', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId: 1, seasonId: 1, awayTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(MATCH_MESSAGES.HOME_TEAM_ID_REQUIRED);
    });

    it('POST /api/v1/matches should fail to create a match by home team not found', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId: 1, seasonId: 1, homeTeamId: 16, awayTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.HOME_TEAM_NOT_FOUND);
    });

    it('POST /api/v1/matches should fail to create a match by missing the away team id', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId: 1, seasonId: 1, homeTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(MATCH_MESSAGES.AWAY_TEAM_ID_REQUIRED);
    });

    it('POST /api/v1/matches should fail to create a match by away team not found', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId: 1, seasonId: 1, homeTeamId: 1, awayTeamId: 15 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.AWAY_TEAM_NOT_FOUND);
    });

    it('POST /api/v1/matches should successfully create a match', async () => {
      const competitionId = 1;
      const seasonId = 1;
      const homeTeamId = 1;
      const awayTeamId = 2;

      const response = await request
        .post('/api/v1/matches')
        .send({ competitionId, seasonId, homeTeamId, awayTeamId })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.match).toBeTruthy();
      expect(response.body.match.competitionId).toEqual(competitionId);
      expect(response.body.match.seasonId).toEqual(seasonId);
      expect(response.body.match.homeTeamId).toEqual(homeTeamId);
      expect(response.body.match.awayTeamId).toEqual(awayTeamId);
    });

    it('PATCH /api/v1/matches/:matchId should fail to update a match by not found', async () => {
      const response = await request
        .patch('/api/v1/matches/14')
        .send({ competitionId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/matches/:matchId should fail to update a match by competition not found', async () => {
      const response = await request
        .patch('/api/v1/matches/3')
        .send({ competitionId: 15 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.COMPETITION_NOT_FOUND);
    });

    it('PATCH /api/v1/matches/:matchId should fail to update a match by season not found', async () => {
      const response = await request
        .patch('/api/v1/matches/3')
        .send({ seasonId: 16 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.SEASON_NOT_FOUND);
    });

    it('PATCH /api/v1/matches/:matchId should fail to update a match by home team not found', async () => {
      const response = await request
        .patch('/api/v1/matches/3')
        .send({ competitionId: 1, seasonId: 1, homeTeamId: 16, awayTeamId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.HOME_TEAM_NOT_FOUND);
    });

    it('PATCH /api/v1/matches/:matchId should fail to update a match by away team not found', async () => {
      const response = await request
        .patch('/api/v1/matches/3')
        .send({ awayTeamId: 15 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.AWAY_TEAM_NOT_FOUND);
    });

    it('PATCH /api/v1/matches/:matchId should successfully update the match', async () => {
      const newCompetitionId = 1;
      const newSeasonId = 1;
      const newHomeTeamId = 3;
      const newAwayTeamId = 2;

      const response = await request
        .patch('/api/v1/matches/3')
        .send({
          competitionId: newCompetitionId,
          seasonId: newSeasonId,
          homeTeamId: newHomeTeamId,
          awayTeamId: newAwayTeamId,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.match).toBeTruthy();
      expect(response.body.match.competitionId).toEqual(newCompetitionId);
      expect(response.body.match.seasonId).toEqual(newSeasonId);
      expect(response.body.match.homeTeamId).toEqual(newHomeTeamId);
      expect(response.body.match.awayTeamId).toEqual(newAwayTeamId);
    });

    it('DELETE /api/v1/matches/:matchId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/matches/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/matches/:matchId should successfully delete a match', async () => {
      const response = await request
        .delete('/api/v1/matches/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.match).toBeTruthy();
      expect(response.body.match.id).toEqual(4);
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

    it('GET /api/v1/matches should return all match in the database', async () => {
      const response = await request
        .get('/api/v1/matches')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matches.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/matches/:matchId should fail to return a match by not found', async () => {
      const response = await request
        .get('/api/v1/matches/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/matches/:matchId should return a match', async () => {
      const response = await request
        .get('/api/v1/matches/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.match).toBeTruthy();
    });

    it('POST /api/v1/matches should fail to create a match by forbidden', async () => {
      const response = await request
        .post('/api/v1/matches')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/matches/:matchId should fail to update a match by forbidden', async () => {
      const response = await request
        .patch('/api/v1/matches/14')
        .send({ name: 'NewMatch' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/matches/:matchId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/matches/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/matches should return all match in the database', async () => {
      const response = await request.get('/api/v1/matches');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.matches.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/matches/:matchId should fail to return a match by not found', async () => {
      const response = await request.get('/api/v1/matches/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(MATCH_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/matches/:matchId should return a match', async () => {
      const response = await request.get('/api/v1/matches/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.match).toBeTruthy();
    });

    it('POST /api/v1/matches should fail to create a match by unauthorized', async () => {
      const response = await request.post('/api/v1/matches').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/matches/:matchId should fail to update a match by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/matches/14')
        .send({ name: 'NewMatch' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/matches/:matchId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/matches/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
