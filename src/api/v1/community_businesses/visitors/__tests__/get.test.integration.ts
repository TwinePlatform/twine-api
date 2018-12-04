import * as Hapi from 'hapi';
import * as Knex from 'knex';
import { init } from '../../../../../server';
import { getConfig } from '../../../../../../config';
import { User, Users, Organisation, Organisations } from '../../../../../models';
import { StandardCredentials } from '../../../../../auth/strategies/standard';


describe('API /community-businesses/{id}/visitors', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let user: User;
  let admin: User;
  let organisation: Organisation;
  let credentials: Hapi.AuthCredentials;
  let adminCreds: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;

    user = await Users.getOne(knex, { where: { name: 'GlaDos' } });
    admin = await Users.getOne(knex, { where: { name: 'Big Boss' } });
    organisation = await Organisations.getOne(knex, { where: { id: 1 } });
    credentials = await StandardCredentials.get(knex, user, organisation);
    adminCreds = await StandardCredentials.get(knex, admin, organisation);
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  describe('GET /community-businesses/{id}/visitors', () => {
    test('non-filtered query', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/visitors',
        credentials,
      });
      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toHaveLength(2);
      expect((<any> res.result).result.visits).not.toBeDefined();
      expect((<any> res.result).result[0]).toEqual(expect.objectContaining({
        name: 'Chell',
        deletedAt: null,
      }));
      expect((<any> res.result).meta).toEqual({ total: 2 });
    });

    test('filtered query', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/visitors?fields[]=name&filter[gender]=male',
        credentials,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({ result: [{ name: 'Turret' }], meta: { total: 1 } });
    });

    test('filtered query with visits', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/visitors?'
          + 'fields[]=name'
          + '&filter[age][]=17'
          + '&filter[age][]=60'
          + '&visits=true',
        credentials,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.arrayContaining([{
          name: 'Chell',
          visits: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              visitActivity: 'Free Running',
            }),
          ]),
        }]),
        meta: { total: 2 },
      });
      expect((<any> res.result).result).toHaveLength(2);
      expect((<any> res.result).result[0].visits).toHaveLength(10);
    });

    test('query child organisation as TWINE_ADMIN', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/1/visitors',
        credentials: adminCreds,
      });
      expect(res.statusCode).toBe(200);
      expect((<any> res.result).result).toHaveLength(2);
      expect((<any> res.result).result.visits).not.toBeDefined();
      expect((<any> res.result).result[0]).toEqual(expect.objectContaining({
        name: 'Chell',
        deletedAt: null,
      }));
      expect((<any> res.result).meta).toEqual({ total: 2 });
    });

    test('can filter users by name', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/visitors?fields[]=name&filter[name]=Chell',
        credentials,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({ result: [{ name: 'Chell' }], meta: { total: 1 } });
    });
  });

  describe('GET /community-businesses/me/visitors/{userId}', () => {
    test('get specific visitor details of own cb w/o visits', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/visitors/1?visits=false',
        credentials,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({
          name: 'Chell',
        }),
      });
      expect((<any> res.result).visits).not.toBeDefined();
    });

    test('get specific visitor details of own cb w/ visits', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/visitors/1?visits=true',
        credentials,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({
          name: 'Chell',
          visits: expect.arrayContaining([
            expect.objectContaining({
              visitActivity: 'Free Running',
            }),
          ]),
        }),
      });
      expect((<any> res.result).result.visits).toHaveLength(10);
    });

    test('get 403 when trying to get non-child visitor', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me/visitors/4',
        credentials,
      });

      expect(res.statusCode).toBe(403);
    });
  });
});
