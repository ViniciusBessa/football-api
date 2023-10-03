import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { TRANSFER_MESSAGES } from '../utils/ajv-validations/transfers-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Transfer Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/transfers should return all transfer in the database', async () => {
      const response = await request
        .get('/api/v1/transfers')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfers.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/transfers/:transferId should fail to return a transfer by not found', async () => {
      const response = await request
        .get('/api/v1/transfers/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/transfers/:transferId should return a transfer', async () => {
      const response = await request
        .get('/api/v1/transfers/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfer.id).toEqual(1);
      expect(response.body.transfer.fee).toEqual(String(100000));
    });

    it('POST /api/v1/transfers should fail to create a transfer by missing the player id', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          previousTeamId: 1,
          newTeamId: 3,
          fee: 100000,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.PLAYER_ID_REQUIRED);
    });

    it('POST /api/v1/transfers should fail to create a transfer by player not found', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 16,
          previousTeamId: 1,
          newTeamId: 3,
          fee: 100000,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.PLAYER_NOT_FOUND);
    });

    it('POST /api/v1/transfers should fail to create a transfer by missing the previous team id', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          newTeamId: 3,
          fee: 100000,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        TRANSFER_MESSAGES.PREVIOUS_TEAM_ID_REQUIRED
      );
    });

    it('POST /api/v1/transfers should fail to create a transfer by previous team not found', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 16,
          newTeamId: 3,
          fee: 100000,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(
        TRANSFER_MESSAGES.PREVIOUS_TEAM_NOT_FOUND
      );
    });

    it('POST /api/v1/transfers should fail to create a transfer by missing the new team id', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 1,
          fee: 100000,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NEW_TEAM_ID_REQUIRED);
    });

    it('POST /api/v1/transfers should fail to create a transfer by new team not found', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 1,
          newTeamId: 30,
          fee: 100000,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NEW_TEAM_NOT_FOUND);
    });

    it('POST /api/v1/transfers should fail to create a transfer by missing the fee', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 1,
          newTeamId: 3,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.FEE_REQUIRED);
    });

    it('POST /api/v1/transfers should fail to create a transfer by fee too low', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 1,
          newTeamId: 3,
          fee: 10,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.FEE_MIN);
    });

    it('POST /api/v1/transfers should fail to create a transfer by fee too high', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 1,
          newTeamId: 3,
          fee: 1000000000000000,
          date: new Date(),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.FEE_MAX);
    });

    it('POST /api/v1/transfers should fail to create a transfer by missing the date', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 1,
          newTeamId: 3,
          fee: 100000,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.DATE_REQUIRED);
    });

    it('POST /api/v1/transfers should fail to create a transfer by wrong date format', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({
          playerId: 1,
          previousTeamId: 1,
          newTeamId: 3,
          fee: 100000,
          date: '123',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.DATE_FORMAT);
    });

    it('POST /api/v1/transfers should successfully create a transfer', async () => {
      const playerId = 1;
      const previousTeamId = 1;
      const newTeamId = 3;
      const fee = 100000;
      const date = new Date('2010-01-01');

      const response = await request
        .post('/api/v1/transfers')
        .send({ playerId, previousTeamId, newTeamId, fee, date })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.transfer).toBeTruthy();
      expect(response.body.transfer.playerId).toEqual(playerId);
      expect(response.body.transfer.previousTeamId).toEqual(previousTeamId);
      expect(response.body.transfer.newTeamId).toEqual(newTeamId);
      expect(response.body.transfer.fee).toEqual(fee.toString());
      expect(response.body.transfer.date).toEqual(date.toISOString());
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by not found', async () => {
      const response = await request
        .patch('/api/v1/transfers/14')
        .send({ playerId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by player not found', async () => {
      const response = await request
        .patch('/api/v1/transfers/3')
        .send({
          playerId: 16,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.PLAYER_NOT_FOUND);
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by previous team not found', async () => {
      const response = await request
        .patch('/api/v1/transfers/3')
        .send({
          previousTeamId: 16,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(
        TRANSFER_MESSAGES.PREVIOUS_TEAM_NOT_FOUND
      );
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by new team not found', async () => {
      const response = await request
        .patch('/api/v1/transfers/3')
        .send({
          newTeamId: 30,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NEW_TEAM_NOT_FOUND);
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by fee too low', async () => {
      const response = await request
        .patch('/api/v1/transfers/3')
        .send({
          fee: 10,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.FEE_MIN);
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by fee too high', async () => {
      const response = await request
        .patch('/api/v1/transfers/3')
        .send({
          fee: 1000000000000000,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.FEE_MAX);
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by wrong date format', async () => {
      const response = await request
        .patch('/api/v1/transfers/3')
        .send({
          date: '123',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.DATE_FORMAT);
    });

    it('PATCH /api/v1/transfers/:transferId should successfully update the transfer', async () => {
      const newPlayerId = 1;
      const previousTeamId = 1;
      const newTeamId = 3;
      const newFee = 100000;
      const newDate = new Date('2010-01-01');

      const response = await request
        .patch('/api/v1/transfers/3')
        .send({
          playerId: newPlayerId,
          previousTeamId,
          newTeamId,
          fee: newFee,
          date: newDate,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfer).toBeTruthy();
      expect(response.body.transfer.playerId).toEqual(newPlayerId);
      expect(response.body.transfer.previousTeamId).toEqual(previousTeamId);
      expect(response.body.transfer.newTeamId).toEqual(newTeamId);
      expect(response.body.transfer.fee).toEqual(newFee.toString());
      expect(response.body.transfer.date).toEqual(newDate.toISOString());
    });

    it('DELETE /api/v1/transfers/:transferId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/transfers/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/transfers/:transferId should successfully delete a transfer', async () => {
      const response = await request
        .delete('/api/v1/transfers/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfer).toBeTruthy();
      expect(response.body.transfer.id).toEqual(4);
      expect(response.body.transfer.fee).toEqual(String(100000));
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

    it('GET /api/v1/transfers should return all transfer in the database', async () => {
      const response = await request
        .get('/api/v1/transfers')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfers.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/transfers/:transferId should fail to return a transfer by not found', async () => {
      const response = await request
        .get('/api/v1/transfers/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/transfers/:transferId should return a transfer', async () => {
      const response = await request
        .get('/api/v1/transfers/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfer.id).toEqual(1);
      expect(response.body.transfer.fee).toEqual(String(100000));
    });

    it('POST /api/v1/transfers should fail to create a transfer by forbidden', async () => {
      const response = await request
        .post('/api/v1/transfers')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by forbidden', async () => {
      const response = await request
        .patch('/api/v1/transfers/14')
        .send({ name: 'NewTransfer' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/transfers/:transferId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/transfers/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/transfers should return all transfer in the database', async () => {
      const response = await request.get('/api/v1/transfers');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfers.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/transfers/:transferId should fail to return a transfer by not found', async () => {
      const response = await request.get('/api/v1/transfers/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TRANSFER_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/transfers/:transferId should return a transfer', async () => {
      const response = await request.get('/api/v1/transfers/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.transfer.id).toEqual(1);
      expect(response.body.transfer.fee).toEqual(String(100000));
    });

    it('POST /api/v1/transfers should fail to create a transfer by unauthorized', async () => {
      const response = await request.post('/api/v1/transfers').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/transfers/:transferId should fail to update a transfer by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/transfers/14')
        .send({ name: 'NewTransfer' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/transfers/:transferId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/transfers/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
