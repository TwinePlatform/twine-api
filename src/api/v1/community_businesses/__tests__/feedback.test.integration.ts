import * as Hapi from 'hapi';
import * as Knex from 'knex';
import { init } from '../../../../server';
import { getConfig } from '../../../../../config';
import { Users, Organisations, LinkedFeedback, User, Organisation } from '../../../../models';
import { getTrx } from '../../../../../tests/utils/database';
import { Credentials } from '../../../../auth/strategies/standard';


describe('/community-business/{id}/feedback', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let trx: Knex.Transaction;
  const config = getConfig(process.env.NODE_ENV);
  const users: Hapi.Util.Dictionary<User> = {};
  const orgs: Hapi.Util.Dictionary<Organisation> = {};
  const creds: Hapi.Util.Dictionary<Hapi.AuthCredentials> = {};

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;

    users.gordon = await Users.getOne(knex, { where: { name: 'Gordon' } });
    users.glados = await Users.getOne(knex, { where: { name: 'GlaDos' } });
    users.bigboss = await Users.getOne(knex, { where: { name: 'Big Boss' } });

    orgs.aperture = await Organisations.getOne(knex, { where: { name: 'Aperture Science' } });
    orgs.blackMesa = await Organisations.getOne(
      knex,
      { where: { name: 'Black Mesa Research' } }
    );

    creds.gordon = await Credentials.get(knex, users.gordon, orgs.blackMesa);
    creds.glados = await Credentials.get(knex, users.glados, orgs.aperture);
    creds.bigboss = await Credentials.get(knex, users.bigboss, orgs.aperture);
  });

  beforeEach(async () => {
    trx = await getTrx(knex);
    server.app.knex = trx;
  });

  afterEach(async () => {
    await trx.rollback();
    server.app.knex = knex;
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  describe('GET /community-businesses/{id}/feebdack', () => {
    test('Get empty feedback for own org as CB_ADMIN when no data', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/feedback',
        credentials: creds.gordon,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toHaveLength(0);
    });

    test('Get all feedback for own org as CB_ADMIN', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/feedback',
        credentials: creds.glados,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toHaveLength(9);
      (<any> res.result).result.forEach((feedback: LinkedFeedback) => {
        expect(typeof feedback.id).toBe('number');
        expect([-1, 0, 1].includes(feedback.score)).toBeTruthy();
      });
    });

    test('Get all feedback between dates for own org as CB_ADMIN', async () => {
      const since = '2018-07-01T10:43:22.231';
      const until = '2018-07-31T10:43:22.231';

      const res = await server.inject({
        method: 'GET',
        url: `/v1/community-businesses/me/feedback?since=${since}&until=${until}`,
        credentials: creds.glados,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result.length).toBeLessThan(9);
      (<any> res.result).result.forEach((feedback: LinkedFeedback) => {
        expect(typeof feedback.id).toBe('number');
        expect([-1, 0, 1].includes(feedback.score)).toBeTruthy();
      });
    });

    test('Get 400 when requesting invalid date limits', async () => {
      const since = 'nope';
      const until = 'never';

      const res = await server.inject({
        method: 'GET',
        url: `/v1/community-businesses/me/feedback?since=${since}&until=${until}`,
        credentials: creds.glados,
      });
      expect(res.statusCode).toBe(400);
    });

    test('Get empty feedback for child org as TWINE_ADMIN when no data', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/2/feedback',
        credentials: creds.bigboss,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toHaveLength(0);
    });

    test('Get all feedback for child org as TWINE_ADMIN', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/1/feedback',
        credentials: creds.bigboss,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toHaveLength(9);
      (<any> res.result).result.forEach((feedback: LinkedFeedback) => {
        expect(typeof feedback.id).toBe('number');
        expect([-1, 0, 1].includes(feedback.score)).toBeTruthy();
      });
    });

    test('Get all feedback between dates for child org as TWINE_ADMIN', async () => {
      const since = '2018-07-01T10:43:22.231';
      const until = '2018-07-31T10:43:22.231';

      const res = await server.inject({
        method: 'GET',
        url: `/v1/community-businesses/1/feedback?since=${since}&until=${until}`,
        credentials: creds.bigboss,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result.length).toBeLessThan(9);
      (<any> res.result).result.forEach((feedback: LinkedFeedback) => {
        expect(typeof feedback.id).toBe('number');
        expect([-1, 0, 1].includes(feedback.score)).toBeTruthy();
      });
    });

    test('Get 400 when requesting invalid date limits as TWINE_ADMIN', async () => {
      const since = 'nope';
      const until = 'never';

      const res = await server.inject({
        method: 'GET',
        url: `/v1/community-businesses/1/feedback?since=${since}&until=${until}`,
        credentials: creds.bigboss,
      });

      expect(res.statusCode).toBe(400);
    });

    test('Get 403 when organisation is not a "child" of user', async () => {
      const res = await server.inject({
        method: 'GET',
        url: `/v1/community-businesses/1/feedback`,
        credentials: creds.glados,
      });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /community-businesses/{id}/feedback/aggregates', () => {
    test('Get zeros for own organisation when has no feedback', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/feedback/aggregates',
        credentials: creds.gordon,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toEqual({
        totalFeedback: 0,
        '-1': 0,
        0: 0,
        1: 0,
      });
    });

    test('Get summary results for own organisation', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/feedback/aggregates',
        credentials: creds.glados,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toEqual({
        totalFeedback: 9,
        '-1': 2,
        0: 4,
        1: 3,
      });
    });

    test('Get summary results for own organisation between date limits', async () => {
      const since = '2018-07-01T00:00:00.000Z';
      const until = '2018-07-31T23:59:59.999Z';

      const res = await server.inject({
        method: 'GET',
        url: `/v1/community-businesses/me/feedback/aggregates?since=${since}&until=${until}`,
        credentials: creds.glados,
      });

      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toEqual({
        totalFeedback: 6,
        '-1': 2,
        0: 3,
        1: 1,
      });
    });

    test('Get 400 for invalid date limits', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/feedback/aggregates?since=nope&until=never',
        credentials: creds.glados,
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /community-businesses/{id}/feedback', () => {
    test('Leave feedback on own org as CB_ADMIN', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/v1/community-businesses/me/feedback',
        payload: { feedbackScore: 1 },
        credentials: creds.gordon,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ score: 1, organisationId: 2 }),
      });
    });
  });
});
