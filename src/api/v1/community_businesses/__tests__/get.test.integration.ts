import * as Hapi from 'hapi';
import * as Knex from 'knex';
import { init } from '../../../../server';
import { getConfig } from '../../../../../config';
import { Users, Organisations } from '../../../../models';
import { RoleEnum } from '../../../../auth/types';


describe('GET /community-businesses', () => {
  let server: Hapi.Server;
  let knex: Knex;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  describe('GET /community-businesses', () => {
    test('Fetching collection returns only list that user is authorised for', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/v1/community-businesses',
        credentials: {
          scope: ['organisations_details-child:read'],
          user: await Users.getOne(knex, { where: { name: 'Gordon' } }),
          organisation: await Organisations.getOne(knex, {
            where: { name: 'Black Mesa Research' },
          }),
        },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /community-businesses/me', () => {
    test('Returns CB that user is authenticated against', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/me',
        credentials: {
          scope: ['organisations_details-own:read'],
          user: await Users.getOne(knex, { where: { name: 'Gordon' } }),
          organisation: await Organisations.getOne(knex, {
            where: { name: 'Black Mesa Research' },
          }),
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ _360GivingId: 'GB-COH-9302' }),
      });
      expect(Object.keys((<any> res.result).result)).toHaveLength(15);
    });
  });

  describe('GET /community-businesses/:id', () => {
    test('Returns requested CB if user is authorised', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/2',
        credentials: {
          role: RoleEnum.TWINE_ADMIN,
          scope: ['organisations_details-child:read'],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ _360GivingId: 'GB-COH-9302' }),
      });
      expect(Object.keys((<any> res.result).result)).toHaveLength(15);
    });

    test('Returns 403 if user is not authorised', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/community-businesses/1',
        credentials: {
          scope: ['organisations_details-child:read'],
          user: await Users.getOne(knex, { where: { name: 'Gordon' } }),
          organisation: await Organisations.getOne(knex, {
            where: { name: 'Black Mesa Research' },
          }),
        },
      });

      expect(res.statusCode).toBe(403);
    });
  });
});
