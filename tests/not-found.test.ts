import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { NOT_FOUND_MESSAGE } from '../middlewares/not-found';

describe('Position Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/randomUrl should fail to access the route by not found', async () => {
      const response = await request
        .get('/api/v1/randomUrl')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(NOT_FOUND_MESSAGE);
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

    it('GET /api/v1/randomUrl should fail to access the route by not found', async () => {
      const response = await request
        .get('/api/v1/randomUrl')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(NOT_FOUND_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/randomUrl should fail to access the route by not found', async () => {
      const response = await request.get('/api/v1/randomUrl');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(NOT_FOUND_MESSAGE);
    });
  });
});
