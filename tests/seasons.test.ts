import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { SEASON_MESSAGES } from '../utils/ajv-validations/seasons-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Season Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/seasons should return all season in the database', async () => {
      const response = await request
        .get('/api/v1/seasons')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.seasons.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/seasons/:seasonId should fail to return a season by not found', async () => {
      const response = await request
        .get('/api/v1/seasons/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(SEASON_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/seasons/:seasonId should return a season', async () => {
      const response = await request
        .get('/api/v1/seasons/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.season.year).toEqual(1920);
    });

    it('POST /api/v1/seasons should fail to create a season by missing the year', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({ start: new Date('1990-01-01'), end: new Date('1990-03-03') })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.YEAR_REQUIRED);
    });

    it('POST /api/v1/seasons should fail to create a season by year too low', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({
          start: new Date('1990-01-01'),
          end: new Date('1990-03-03'),
          year: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.YEAR_MIN);
    });

    it('POST /api/v1/seasons should fail to create a season by year too high', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({
          start: new Date('1990-01-01'),
          end: new Date('1990-03-03'),
          year: 9999,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.YEAR_MAX);
    });

    it('POST /api/v1/seasons should fail to create a season by year in use', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({
          start: new Date('1990-01-01'),
          end: new Date('1990-03-03'),
          year: 1920,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.YEAR_IN_USE);
    });

    it('POST /api/v1/seasons should fail to create a season by missing the starting date', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({ end: new Date('1994-06-25'), year: 1994 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.START_REQUIRED);
    });

    it('POST /api/v1/seasons should fail to create a season by invalid stating date format', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({ start: '123', end: new Date('1994-06-25'), year: 1994 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.START_FORMAT);
    });

    it('POST /api/v1/seasons should fail to create a season by missing the ending date', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({ start: new Date('1994-01-01'), year: 1994 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.END_REQUIRED);
    });

    it('POST /api/v1/seasons should fail to create a season by invalid ending date format', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({ start: new Date('1994-01-01'), end: '123', year: 1994 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.END_FORMAT);
    });

    it('POST /api/v1/seasons should successfully create a season', async () => {
      const year = 1994;
      const start = new Date('1994-01-01');
      const end = new Date('1994-06-25');
      const isCurrent = true;
      const response = await request
        .post('/api/v1/seasons')
        .send({ year, start, end, isCurrent })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.season).toBeTruthy();
      expect(response.body.season.year).toEqual(year);
      expect(response.body.season.start).toEqual(start.toISOString());
      expect(response.body.season.end).toEqual(end.toISOString());
      expect(response.body.season.isCurrent).toEqual(isCurrent);
    });

    it('PATCH /api/v1/seasons/:seasonId should fail to update a season by year too low', async () => {
      const response = await request
        .patch('/api/v1/seasons/3')
        .send({ year: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.YEAR_MIN);
    });

    it('PATCH /api/v1/seasons/:seasonId should fail to update a season by year too high', async () => {
      const response = await request
        .patch('/api/v1/seasons/3')
        .send({ year: 9999 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.YEAR_MAX);
    });

    it('PATCH /api/v1/seasons/:seasonId should fail to update a season by year in use', async () => {
      const response = await request
        .patch('/api/v1/seasons/3')
        .send({ year: 1920 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.YEAR_IN_USE);
    });

    it('PATCH /api/v1/seasons/:seasonId should fail to update a season by invalid stating date format', async () => {
      const response = await request
        .patch('/api/v1/seasons/3')
        .send({ start: '123' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.START_FORMAT);
    });

    it('PATCH /api/v1/seasons/:seasonId should fail to update a season by invalid ending date format', async () => {
      const response = await request
        .patch('/api/v1/seasons/3')
        .send({ end: '123' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(SEASON_MESSAGES.END_FORMAT);
    });

    it('PATCH /api/v1/seasons/:seasonId should successfully update the season', async () => {
      const newYear = 2011;
      const newStart = new Date('1995-01-01');
      const newEnd = new Date('1995-12-25');

      const response = await request
        .patch('/api/v1/seasons/3')
        .send({ year: newYear, start: newStart, end: newEnd })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.season).toBeTruthy();
      expect(response.body.season.year).toEqual(newYear);
      expect(response.body.season.start).toEqual(newStart.toISOString());
      expect(response.body.season.end).toEqual(newEnd.toISOString());
    });

    it('DELETE /api/v1/seasons/:seasonId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/seasons/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(SEASON_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/seasons/:seasonId should successfully delete a season', async () => {
      const response = await request
        .delete('/api/v1/seasons/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.season).toBeTruthy();
      expect(response.body.season.year).toEqual(2000);
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

    it('GET /api/v1/seasons should return all season in the database', async () => {
      const response = await request
        .get('/api/v1/seasons')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.seasons.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/seasons/:seasonId should fail to return a season by not found', async () => {
      const response = await request
        .get('/api/v1/seasons/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(SEASON_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/seasons/:seasonId should return a season', async () => {
      const response = await request
        .get('/api/v1/seasons/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.season.year).toEqual(1920);
    });

    it('POST /api/v1/seasons should fail to create a season by forbidden', async () => {
      const response = await request
        .post('/api/v1/seasons')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/seasons/:seasonId should fail to update a season by forbidden', async () => {
      const response = await request
        .patch('/api/v1/seasons/14')
        .send({ name: 'NewSeason' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/seasons/:seasonId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/seasons/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/seasons should return all season in the database', async () => {
      const response = await request.get('/api/v1/seasons');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.seasons.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/seasons/:seasonId should fail to return a season by not found', async () => {
      const response = await request.get('/api/v1/seasons/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(SEASON_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/seasons/:seasonId should return a season', async () => {
      const response = await request.get('/api/v1/seasons/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.season.year).toEqual(1920);
    });

    it('POST /api/v1/seasons should fail to create a season by unauthorized', async () => {
      const response = await request.post('/api/v1/seasons').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/seasons/:seasonId should fail to update a season by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/seasons/14')
        .send({ name: 'NewSeason' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/seasons/:seasonId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/seasons/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
