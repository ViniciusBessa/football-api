import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { POSITION_MESSAGES } from '../utils/ajv-validations/positions-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

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

    it('GET /api/v1/positions should return all positions in the database', async () => {
      const response = await request
        .get('/api/v1/positions')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.positions.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/positions/:positionId should return a position', async () => {
      const response = await request
        .get('/api/v1/positions/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.position.name).toEqual('Goalkeeper');
    });

    it('POST /api/v1/positions should fail to create a position by missing the name', async () => {
      const response = await request
        .post('/api/v1/positions')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NAME_REQUIRED);
    });

    it('POST /api/v1/positions should fail to create a position by name too short', async () => {
      const response = await request
        .post('/api/v1/positions')
        .send({ name: 'Pos' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NAME_MIN_LENGTH);
    });

    it('POST /api/v1/positions should fail to create a position by name too long', async () => {
      const response = await request
        .post('/api/v1/positions')
        .send({ name: 'Pos'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NAME_MAX_LENGTH);
    });

    it('POST /api/v1/positions should fail to create a position by name in use', async () => {
      const response = await request
        .post('/api/v1/positions')
        .send({ name: 'Goalkeeper' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NAME_IN_USE);
    });

    it('POST /api/v1/positions should successfully create a position', async () => {
      const name = 'Midfielder';
      const response = await request
        .post('/api/v1/positions')
        .send({ name })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.position).toBeTruthy();
      expect(response.body.position.name).toEqual(name);
    });

    it('PATCH /api/v1/positions/:positionId should fail to update a position by not found', async () => {
      const response = await request
        .patch('/api/v1/positions/14')
        .send({ name: 'NewPosition' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/positions/:positionId should fail to update a position by name in use', async () => {
      const response = await request
        .patch('/api/v1/positions/3')
        .send({ name: 'Goalkeeper' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NAME_IN_USE);
    });

    it('PATCH /api/v1/positions/:positionId should fail to update a position by name too short', async () => {
      const response = await request
        .patch('/api/v1/positions/3')
        .send({ name: 'Pos' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NAME_MIN_LENGTH);
    });

    it('PATCH /api/v1/positions/:positionId should fail to update a position by name too long', async () => {
      const response = await request
        .patch('/api/v1/positions/3')
        .send({ name: 'Pos'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NAME_MAX_LENGTH);
    });

    it('PATCH /api/v1/positions/:positionId should successfully update the position', async () => {
      const newName = 'NewPosition';
      const response = await request
        .patch('/api/v1/positions/3')
        .send({ name: newName })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.position).toBeTruthy();
      expect(response.body.position.name).toEqual(newName);
    });

    it('DELETE /api/v1/positions/:positionId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/positions/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(POSITION_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/positions/:positionId should successfully delete a position', async () => {
      const response = await request
        .delete('/api/v1/positions/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.position).toBeTruthy();
      expect(response.body.position.name).toEqual('Centre Forward');
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

    it('GET /api/v1/positions should return all positions in the database', async () => {
      const response = await request
        .get('/api/v1/positions')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.positions.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/positions/:positionId should return a position', async () => {
      const response = await request
        .get('/api/v1/positions/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.position.name).toEqual('Goalkeeper');
    });

    it('POST /api/v1/positions should fail to create a position by forbidden', async () => {
      const response = await request
        .post('/api/v1/positions')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/positions/:positionId should fail to update a position by forbidden', async () => {
      const response = await request
        .patch('/api/v1/positions/14')
        .send({ name: 'NewPosition' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/positions/:positionId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/positions/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/positions should return all positions in the database', async () => {
      const response = await request.get('/api/v1/positions');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.positions.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/positions/:positionId should return a position', async () => {
      const response = await request.get('/api/v1/positions/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.position.name).toEqual('Goalkeeper');
    });

    it('POST /api/v1/positions should fail to create a position by unauthorized', async () => {
      const response = await request.post('/api/v1/positions').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/positions/:positionId should fail to update a position by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/positions/14')
        .send({ name: 'NewPosition' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/positions/:positionId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/positions/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
