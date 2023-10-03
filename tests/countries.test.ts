import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { COUNTRY_MESSAGES } from '../utils/ajv-validations/countries-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Country Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/countries should return all country in the database', async () => {
      const response = await request
        .get('/api/v1/countries')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.countries.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/countries/:countryId should fail to return a country by not found', async () => {
      const response = await request
        .get('/api/v1/countries/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/countries/:countryId should return a country', async () => {
      const response = await request
        .get('/api/v1/countries/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.country.name).toEqual('Brazil');
    });

    it('POST /api/v1/countries should fail to create a country by missing the name', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ code: 'PT', flagUrl: 'flag.jpg' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NAME_REQUIRED);
    });

    it('POST /api/v1/countries should fail to create a country by name too short', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ code: 'PT', flagUrl: 'flag.jpg', name: 'Pos' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NAME_MIN_LENGTH);
    });

    it('POST /api/v1/countries should fail to create a country by name too long', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ code: 'PT', flagUrl: 'flag.jpg', name: 'Pos'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NAME_MAX_LENGTH);
    });

    it('POST /api/v1/countries should fail to create a country by name in use', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ code: 'PT', flagUrl: 'flag.jpg', name: 'Brazil' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NAME_IN_USE);
    });

    it('POST /api/v1/countries should fail to create a country by missing the code', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ flagUrl: 'flag.jpg', name: 'Portugal' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.CODE_REQUIRED);
    });

    it('POST /api/v1/countries should fail to create a country by code having the wrong length', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ code: 'P', flagUrl: 'flag.jpg', name: 'Portugal' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.CODE_LENGTH);
    });

    it('POST /api/v1/countries should fail to create a country by code in use', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ code: 'BR', flagUrl: 'flag.jpg', name: 'Portugal' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.CODE_IN_USE);
    });

    it('POST /api/v1/countries should fail to create a country by missing the flag url', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({ code: 'PT', name: 'Portugal' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.FLAG_URL_REQUIRED);
    });

    it('POST /api/v1/countries should successfully create a country', async () => {
      const name = 'Portugal';
      const code = 'PT';
      const flagUrl = 'flag.jpg';
      const response = await request
        .post('/api/v1/countries')
        .send({ name, code, flagUrl })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.country).toBeTruthy();
      expect(response.body.country.name).toEqual(name);
      expect(response.body.country.code).toEqual(code);
      expect(response.body.country.flagUrl).toEqual(flagUrl);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by not found', async () => {
      const response = await request
        .patch('/api/v1/countries/14')
        .send({ name: 'NewCountry' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by name in use', async () => {
      const response = await request
        .patch('/api/v1/countries/3')
        .send({ name: 'Brazil' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NAME_IN_USE);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by name too short', async () => {
      const response = await request
        .patch('/api/v1/countries/3')
        .send({ name: 'Cou' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NAME_MIN_LENGTH);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by name too long', async () => {
      const response = await request
        .patch('/api/v1/countries/3')
        .send({ name: 'Cou'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NAME_MAX_LENGTH);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by code having the wrong length', async () => {
      const response = await request
        .patch('/api/v1/countries/3')
        .send({ code: 'P' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.CODE_LENGTH);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by code in use', async () => {
      const response = await request
        .patch('/api/v1/countries/3')
        .send({ code: 'BR' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.CODE_IN_USE);
    });

    it('PATCH /api/v1/countries/:countryId should successfully update the country', async () => {
      const newName = 'NewCountry';
      const response = await request
        .patch('/api/v1/countries/3')
        .send({ name: newName })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.country).toBeTruthy();
      expect(response.body.country.name).toEqual(newName);
    });

    it('DELETE /api/v1/countries/:countryId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/countries/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/countries/:countryId should successfully delete a country', async () => {
      const response = await request
        .delete('/api/v1/countries/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.country).toBeTruthy();
      expect(response.body.country.name).toEqual('Uruguay');
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

    it('GET /api/v1/countries should return all country in the database', async () => {
      const response = await request
        .get('/api/v1/countries')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.countries.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/countries/:countryId should fail to return a country by not found', async () => {
      const response = await request
        .get('/api/v1/countries/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/countries/:countryId should return a country', async () => {
      const response = await request
        .get('/api/v1/countries/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.country.name).toEqual('Brazil');
    });

    it('POST /api/v1/countries should fail to create a country by forbidden', async () => {
      const response = await request
        .post('/api/v1/countries')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by forbidden', async () => {
      const response = await request
        .patch('/api/v1/countries/14')
        .send({ name: 'NewCountry' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/countries/:countryId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/countries/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/countries should return all country in the database', async () => {
      const response = await request.get('/api/v1/countries');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.countries.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/countries/:countryId should fail to return a country by not found', async () => {
      const response = await request.get('/api/v1/countries/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(COUNTRY_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/countries/:countryId should return a country', async () => {
      const response = await request.get('/api/v1/countries/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.country.name).toEqual('Brazil');
    });

    it('POST /api/v1/countries should fail to create a country by unauthorized', async () => {
      const response = await request.post('/api/v1/countries').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/countries/:countryId should fail to update a country by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/countries/14')
        .send({ name: 'NewCountry' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/countries/:countryId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/countries/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
