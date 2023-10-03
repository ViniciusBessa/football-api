import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it } from 'bun:test';
import { PLAYER_MESSAGES } from '../utils/ajv-validations/players-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';

describe('Player Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/players should return all player in the database', async () => {
      const response = await request
        .get('/api/v1/players')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.players.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/players/:playerId should fail to return a player by not found', async () => {
      const response = await request
        .get('/api/v1/players/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/players/:playerId should return a player', async () => {
      const response = await request
        .get('/api/v1/players/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.player.name).toEqual('Player A');
    });

    it('POST /api/v1/players should fail to create a player by missing the name', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NAME_REQUIRED);
    });

    it('POST /api/v1/players should fail to create a player by name too short', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NAME_MIN_LENGTH);
    });

    it('POST /api/v1/players should fail to create a player by name too long', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player'.repeat(10),
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NAME_MAX_LENGTH);
    });

    it('POST /api/v1/players should fail to create a player by name in use', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'Player A',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NAME_IN_USE);
    });

    it('POST /api/v1/players should fail to create a player by missing the date of birth', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.DATE_OF_BIRTH_REQUIRED);
    });

    it('POST /api/v1/players should fail to create a player by invalid date of birth', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          dateOfBirth: new Date('1600-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.DATE_OF_BIRTH_MIN);
    });

    it('POST /api/v1/players should fail to create a player by date of birth with wrong format', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: '123',
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.DATE_OF_BIRTH_FORMAT);
    });

    it('POST /api/v1/players should fail to create a player by missing the height', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.HEIGHT_REQUIRED);
    });

    it('POST /api/v1/players should fail to create a player by height too low', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.1,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.HEIGHT_MIN);
    });

    it('POST /api/v1/players should fail to create a player by height too high', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 3.5,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.HEIGHT_MAX);
    });

    it('POST /api/v1/players should fail to create a player by missing the weight', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.WEIGHT_REQUIRED);
    });

    it('POST /api/v1/players should fail to create a player by weight too low', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 30.1,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.WEIGHT_MIN);
    });

    it('POST /api/v1/players should fail to create a player by weight too high', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 220.2,
          positionId: 1,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.WEIGHT_MAX);
    });

    it('POST /api/v1/players should fail to create a player by missing the position id', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.POSITION_ID_REQUIRED);
    });

    it('POST /api/v1/players should fail to create a player by position not found', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 40,
          countryId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.POSITION_NOT_FOUND);
    });

    it('POST /api/v1/players should fail to create a player by missing the country id', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.COUNTRY_ID_REQUIRED);
    });

    it('POST /api/v1/players should fail to create a player by country not found', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 20,
          currentTeamId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.COUNTRY_NOT_FOUND);
    });

    it('POST /api/v1/players should fail to create a player by missing the current team id', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        PLAYER_MESSAGES.CURRENT_TEAM_ID_REQUIRED
      );
    });

    it('POST /api/v1/players should fail to create a player by current team not found', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({
          name: 'New Player',
          dateOfBirth: new Date('1997-01-01'),
          height: 1.85,
          weight: 75.3,
          positionId: 1,
          countryId: 1,
          currentTeamId: 10,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.CURRENT_TEAM_NOT_FOUND);
    });

    it('POST /api/v1/players should successfully create a player', async () => {
      const name = 'New Player';
      const dateOfBirth = new Date('1997-01-01');
      const height = 1.85;
      const weight = 80;
      const positionId = 1;
      const countryId = 1;
      const currentTeamId = 1;

      const response = await request
        .post('/api/v1/players')
        .send({
          name,
          dateOfBirth,
          height,
          weight,
          positionId,
          countryId,
          currentTeamId,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.player).toBeTruthy();
      expect(response.body.player.name).toEqual(name);
      expect(response.body.player.dateOfBirth).toEqual(
        dateOfBirth.toISOString()
      );
      expect(response.body.player.height).toEqual(height.toString());
      expect(response.body.player.weight).toEqual(weight.toString());
      expect(response.body.player.positionId).toEqual(positionId);
      expect(response.body.player.countryId).toEqual(countryId);
      expect(response.body.player.currentTeamId).toEqual(currentTeamId);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by name too short', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          name: 'New',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NAME_MIN_LENGTH);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by name too long', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          name: 'New Player'.repeat(10),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NAME_MAX_LENGTH);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by name in use', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          name: 'Player A',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NAME_IN_USE);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by invalid date of birth', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          dateOfBirth: new Date('1600-01-01'),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.DATE_OF_BIRTH_MIN);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by date of birth with wrong format', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          dateOfBirth: '123',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.DATE_OF_BIRTH_FORMAT);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by height too low', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          height: 1.1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.HEIGHT_MIN);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by height too high', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          height: 3.5,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.HEIGHT_MAX);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by weight too low', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          weight: 30.1,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.WEIGHT_MIN);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by weight too high', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          weight: 220.2,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.WEIGHT_MAX);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by position not found', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          positionId: 40,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.POSITION_NOT_FOUND);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by country not found', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          countryId: 20,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.COUNTRY_NOT_FOUND);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by current team not found', async () => {
      const response = await request
        .patch('/api/v1/players/3')
        .send({
          currentTeamId: 10,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.CURRENT_TEAM_NOT_FOUND);
    });

    it('PATCH /api/v1/players/:playerId should successfully update the player', async () => {
      const newName = 'New name';
      const newDateOfBirth = new Date('1997-01-01');
      const newHeight = 1.85;
      const newWeight = 80;
      const newPositionId = 1;
      const newCountryId = 1;
      const newCurrentTeamId = 1;

      const response = await request
        .patch('/api/v1/players/3')
        .send({
          name: newName,
          dateOfBirth: newDateOfBirth,
          height: newHeight,
          weight: newWeight,
          positionId: newPositionId,
          countryId: newCountryId,
          currentTeamId: newCurrentTeamId,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.player).toBeTruthy();
      expect(response.body.player.name).toEqual(newName);
      expect(response.body.player.dateOfBirth).toEqual(
        newDateOfBirth.toISOString()
      );
      expect(response.body.player.height).toEqual(newHeight.toString());
      expect(response.body.player.weight).toEqual(newWeight.toString());
      expect(response.body.player.positionId).toEqual(newPositionId);
      expect(response.body.player.countryId).toEqual(newCountryId);
      expect(response.body.player.currentTeamId).toEqual(newCurrentTeamId);
    });

    it('DELETE /api/v1/players/:playerId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/players/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/players/:playerId should successfully delete a player', async () => {
      const response = await request
        .delete('/api/v1/players/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.player).toBeTruthy();
      expect(response.body.player.name).toEqual('Player D');
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

    it('GET /api/v1/players should return all player in the database', async () => {
      const response = await request
        .get('/api/v1/players')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.players.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/players/:playerId should fail to return a player by not found', async () => {
      const response = await request
        .get('/api/v1/players/15')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/players/:playerId should return a player', async () => {
      const response = await request
        .get('/api/v1/players/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.player.name).toEqual('Player A');
    });

    it('POST /api/v1/players should fail to create a player by forbidden', async () => {
      const response = await request
        .post('/api/v1/players')
        .send({})
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by forbidden', async () => {
      const response = await request
        .patch('/api/v1/players/14')
        .send({ name: 'NewPlayer' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/players/:playerId should fail by forbidden', async () => {
      const response = await request
        .delete('/api/v1/players/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/players should return all player in the database', async () => {
      const response = await request.get('/api/v1/players');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.players.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/players/:playerId should fail to return a player by not found', async () => {
      const response = await request.get('/api/v1/players/15');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(PLAYER_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/players/:playerId should return a player', async () => {
      const response = await request.get('/api/v1/players/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.player.name).toEqual('Player A');
    });

    it('POST /api/v1/players should fail to create a player by unauthorized', async () => {
      const response = await request.post('/api/v1/players').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/players/:playerId should fail to update a player by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/players/14')
        .send({ name: 'NewPlayer' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/players/:playerId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/players/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
