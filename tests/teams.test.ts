import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { TEAM_MESSAGES } from '../utils/ajv-validations/teams-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Team Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/teams should return all team in the database', async () => {
      const response = await request
        .get('/api/v1/teams')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.teams.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/teams/:teamId should fail to return a team by not found', async () => {
      const response = await request
        .get('/api/v1/teams/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/teams/:teamId should return a team', async () => {
      const response = await request
        .get('/api/v1/teams/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.team.name).toEqual('Team A');
    });

    it('POST /api/v1/teams should fail to create a team by missing the name', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NAME_REQUIRED);
    });

    it('POST /api/v1/teams should fail to create a team by name too short', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Te',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NAME_MIN_LENGTH);
    });

    it('POST /api/v1/teams should fail to create a team by name too long', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E'.repeat(100),
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NAME_MAX_LENGTH);
    });

    it('POST /api/v1/teams should fail to create a team by name in use', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team A',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NAME_IN_USE);
    });

    it('POST /api/v1/teams should fail to create a team by missing the code', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.CODE_REQUIRED);
    });

    it('POST /api/v1/teams should fail to create a team by code having the wrong length', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEEEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.CODE_LENGTH);
    });

    it('POST /api/v1/teams should fail to create a team by code in use', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEA',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.CODE_IN_USE);
    });

    it('POST /api/v1/teams should fail to create a team by missing the logo url', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEE',
          foundingDate: new Date('1960-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.LOGO_URL_REQUIRED);
    });

    it('POST /api/v1/teams should fail to create a team by missing the founding date', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.FOUNDING_DATE_REQUIRED);
    });

    it('POST /api/v1/teams should fail to create a team by invalid founding date format', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: '123',
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.FOUNDING_DATE_FORMAT);
    });

    it('POST /api/v1/teams should fail to create a team by founding date too low', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1700-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.FOUNDING_DATE_MIN);
    });

    it('POST /api/v1/teams should fail to create a team by founding date too high', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('2900-01-01'),
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.FOUNDING_DATE_MAX);
    });

    it('POST /api/v1/teams should fail to create a team by missing the country id', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.COUNTRY_ID_REQUIRED);
    });

    it('POST /api/v1/teams should fail to create a team by country not found', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({
          name: 'Team E',
          code: 'TEE',
          logoUrl: 'flag.jpg',
          foundingDate: new Date('1960-01-01'),
          countryId: 20,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TEAM_MESSAGES.COUNTRY_NOT_FOUND);
    });

    it('POST /api/v1/teams should successfully create a team', async () => {
      const name = 'Team E';
      const code = 'TEE';
      const logoUrl = 'flag.jpg';
      const foundingDate = new Date('1960-01-01');
      const countryId = 1;

      const response = await request
        .post('/api/v1/teams')
        .send({
          name,
          code,
          logoUrl,
          foundingDate,
          countryId,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.team).toBeTruthy();
      expect(response.body.team.name).toEqual(name);
      expect(response.body.team.code).toEqual(code);
      expect(response.body.team.logoUrl).toEqual(logoUrl);
      expect(response.body.team.foundingDate).toEqual(
        foundingDate.toISOString()
      );
      expect(response.body.team.countryId).toEqual(countryId);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by not found', async () => {
      const response = await request
        .patch('/api/v1/teams/14')
        .send({ name: 'Not found team' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by name in use', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({ name: 'Team A' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NAME_IN_USE);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by name too short', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({ name: 'Cou' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NAME_MIN_LENGTH);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by name too long', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({ name: 'Cou'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NAME_MAX_LENGTH);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by code having the wrong length', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({ code: 'P' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.CODE_LENGTH);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by code in use', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({ code: 'TEA' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.CODE_IN_USE);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by invalid founding date format', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({
          foundingDate: '123',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.FOUNDING_DATE_FORMAT);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by founding date too low', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({
          foundingDate: new Date('1700-01-01'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.FOUNDING_DATE_MIN);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by founding date too high', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({
          foundingDate: new Date('2900-01-01'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TEAM_MESSAGES.FOUNDING_DATE_MAX);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by country not found', async () => {
      const response = await request
        .patch('/api/v1/teams/3')
        .send({
          countryId: 20,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TEAM_MESSAGES.COUNTRY_NOT_FOUND);
    });

    it('PATCH /api/v1/teams/:teamId should successfully update the team', async () => {
      const newName = 'NewTeam';
      const newCode = 'TEF';
      const newLogoUrl = 'newLogo.jpg';
      const newFoundingDate = new Date('2000-01-01');
      const newIsNational = true;
      const newCountryId = 2;

      const response = await request
        .patch('/api/v1/teams/3')
        .send({
          name: newName,
          code: newCode,
          logoUrl: newLogoUrl,
          foundingDate: newFoundingDate,
          isNational: newIsNational,
          countryId: newCountryId,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.team).toBeTruthy();
      expect(response.body.team.name).toEqual(newName);
      expect(response.body.team.code).toEqual(newCode);
      expect(response.body.team.logoUrl).toEqual(newLogoUrl);
      expect(response.body.team.foundingDate).toEqual(
        newFoundingDate.toISOString()
      );
      expect(response.body.team.isNational).toEqual(newIsNational);
      expect(response.body.team.countryId).toEqual(newCountryId);
    });

    it('DELETE /api/v1/teams/:teamId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/teams/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/teams/:teamId should successfully delete a team', async () => {
      const response = await request
        .delete('/api/v1/teams/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.team).toBeTruthy();
      expect(response.body.team.name).toEqual('Team D');
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

    it('GET /api/v1/teams should return all team in the database', async () => {
      const response = await request
        .get('/api/v1/teams')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.teams.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/teams/:teamId should fail to return a team by not found', async () => {
      const response = await request
        .get('/api/v1/teams/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/teams/:teamId should return a team', async () => {
      const response = await request
        .get('/api/v1/teams/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.team.name).toEqual('Team A');
    });

    it('POST /api/v1/teams should fail to create a team by forbidden', async () => {
      const response = await request
        .post('/api/v1/teams')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by forbidden', async () => {
      const response = await request
        .patch('/api/v1/teams/14')
        .send({ name: 'NewTeam' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/teams/:teamId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/teams/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/teams should return all team in the database', async () => {
      const response = await request.get('/api/v1/teams');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.teams.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/teams/:teamId should fail to return a team by not found', async () => {
      const response = await request.get('/api/v1/teams/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TEAM_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/teams/:teamId should return a team', async () => {
      const response = await request.get('/api/v1/teams/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.team.name).toEqual('Team A');
    });

    it('POST /api/v1/teams should fail to create a team by unauthorized', async () => {
      const response = await request.post('/api/v1/teams').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/teams/:teamId should fail to update a team by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/teams/14')
        .send({ name: 'NewTeam' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/teams/:teamId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/teams/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
