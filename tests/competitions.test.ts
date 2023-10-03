import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { COMPETITION_MESSAGES } from '../utils/ajv-validations/competitions-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';
import { CompetitionType } from '@prisma/client';

describe('Competition Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/competitions should return all competition in the database', async () => {
      const response = await request
        .get('/api/v1/competitions')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competitions.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/competitions/:competitionId should return a competition', async () => {
      const response = await request
        .get('/api/v1/competitions/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competition.name).toEqual('BF Cup');
    });

    it('POST /api/v1/competitions should fail to create a competition by missing the name', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({ code: 'PT', logoUrl: 'logo.jpg', type: CompetitionType.CUP })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NAME_REQUIRED);
    });

    it('POST /api/v1/competitions should fail to create a competition by name too short', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({
          code: 'PT',
          logoUrl: 'logo.jpg',
          name: 'Comp',
          type: CompetitionType.CUP,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NAME_MIN_LENGTH);
    });

    it('POST /api/v1/competitions should fail to create a competition by name too long', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({
          code: 'PT',
          logoUrl: 'logo.jpg',
          name: 'Comp'.repeat(100),
          type: CompetitionType.CUP,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NAME_MAX_LENGTH);
    });

    it('POST /api/v1/competitions should fail to create a competition by name in use', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({
          code: 'PT',
          logoUrl: 'logo.jpg',
          name: 'BF Cup',
          type: CompetitionType.CUP,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NAME_IN_USE);
    });

    it('POST /api/v1/competitions should fail to create a competition by missing the code', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({
          logoUrl: 'logo.jpg',
          name: 'Portuguese Cup',
          type: CompetitionType.CUP,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.CODE_REQUIRED);
    });

    it('POST /api/v1/competitions should fail to create a competition by code having the wrong length', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({
          code: 'P',
          logoUrl: 'logo.jpg',
          name: 'Portuguese Cup',
          type: CompetitionType.CUP,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.CODE_LENGTH);
    });

    it('POST /api/v1/competitions should fail to create a competition by code in use', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({
          code: 'BF',
          logoUrl: 'logo.jpg',
          name: 'Portuguese Cup',
          type: CompetitionType.CUP,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.CODE_IN_USE);
    });

    it('POST /api/v1/competitions should fail to create a competition by missing the logo url', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({ code: 'PT', name: 'Portuguese Cup', type: CompetitionType.CUP })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.LOGO_URL_REQUIRED);
    });

    it('POST /api/v1/competitions should fail to create a competition by missing the type', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({ code: 'PT', name: 'Portuguese Cup', logoUrl: 'logo.jpg' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.TYPE_REQUIRED);
    });

    it('POST /api/v1/competitions should fail to create a competition by invalid type', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({
          code: 'PT',
          name: 'Portuguese Cup',
          logoUrl: 'logo.jpg',
          type: 'NewType',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.TYPE);
    });

    it('POST /api/v1/competitions should successfully create a competition', async () => {
      const name = 'Portuguese Cup';
      const code = 'PT';
      const logoUrl = 'logo.jpg';
      const type = CompetitionType.CUP;
      const response = await request
        .post('/api/v1/competitions')
        .send({ name, code, logoUrl, type })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.competition).toBeTruthy();
      expect(response.body.competition.name).toEqual(name);
      expect(response.body.competition.code).toEqual(code);
      expect(response.body.competition.logoUrl).toEqual(logoUrl);
      expect(response.body.competition.type).toEqual(type);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by not found', async () => {
      const response = await request
        .patch('/api/v1/competitions/14')
        .send({ name: 'NewCompetition' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by name in use', async () => {
      const response = await request
        .patch('/api/v1/competitions/3')
        .send({ name: 'BF Cup' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NAME_IN_USE);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by name too short', async () => {
      const response = await request
        .patch('/api/v1/competitions/3')
        .send({ name: 'Cou' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NAME_MIN_LENGTH);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by name too long', async () => {
      const response = await request
        .patch('/api/v1/competitions/3')
        .send({ name: 'Cou'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NAME_MAX_LENGTH);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by code having the wrong length', async () => {
      const response = await request
        .patch('/api/v1/competitions/3')
        .send({ code: 'P' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.CODE_LENGTH);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by code in use', async () => {
      const response = await request
        .patch('/api/v1/competitions/3')
        .send({ code: 'BF' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.CODE_IN_USE);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by type invalid', async () => {
      const response = await request
        .patch('/api/v1/competitions/3')
        .send({ type: 'NewType' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.TYPE);
    });

    it('PATCH /api/v1/competitions/:competitionId should successfully update the competition', async () => {
      const newName = 'NewCompetition';
      const response = await request
        .patch('/api/v1/competitions/3')
        .send({ name: newName })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competition).toBeTruthy();
      expect(response.body.competition.name).toEqual(newName);
    });

    it('DELETE /api/v1/competitions/:competitionId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/competitions/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(COMPETITION_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/competitions/:competitionId should successfully delete a competition', async () => {
      const response = await request
        .delete('/api/v1/competitions/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competition).toBeTruthy();
      expect(response.body.competition.name).toEqual('Patski League');
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

    it('GET /api/v1/competitions should return all competition in the database', async () => {
      const response = await request
        .get('/api/v1/competitions')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competitions.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/competitions/:competitionId should return a competition', async () => {
      const response = await request
        .get('/api/v1/competitions/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competition.name).toEqual('BF Cup');
    });

    it('POST /api/v1/competitions should fail to create a competition by forbidden', async () => {
      const response = await request
        .post('/api/v1/competitions')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by forbidden', async () => {
      const response = await request
        .patch('/api/v1/competitions/14')
        .send({ name: 'NewCompetition' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/competitions/:competitionId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/competitions/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/competitions should return all competition in the database', async () => {
      const response = await request.get('/api/v1/competitions');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competitions.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/competitions/:competitionId should return a competition', async () => {
      const response = await request.get('/api/v1/competitions/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.competition.name).toEqual('BF Cup');
    });

    it('POST /api/v1/competitions should fail to create a competition by unauthorized', async () => {
      const response = await request.post('/api/v1/competitions').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/competitions/:competitionId should fail to update a competition by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/competitions/14')
        .send({ name: 'NewCompetition' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/competitions/:competitionId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/competitions/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
