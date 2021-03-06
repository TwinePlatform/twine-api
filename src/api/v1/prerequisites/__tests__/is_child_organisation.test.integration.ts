import * as Hapi from 'hapi';
import * as Knex from 'knex';
import { init } from '../../../../../tests/utils/server';
import { RoleEnum } from '../../../../auth/types';
import { getConfig } from '../../../../../config';
import { Users, CommunityBusinesses } from '../../../../models';
import pre from '../is_child_organisation';


describe('Pre-requisite :: is_child_organisation', () => {
  let server: Hapi.Server;
  const config = getConfig(process.env.NODE_ENV);
  const knex = Knex(config.knex);

  beforeAll(async () => {
    server = await init(config, { knex });

    server.route({
      method: 'GET',
      path: '/foo',
      options: {
        pre: [{ method: pre, assign: 'is' }],
      },
      handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => request.pre,
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });

  test('returns false when user is CB_ADMIN for community business', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/foo',
      credentials: {
        user: {
          roles: [RoleEnum.CB_ADMIN],
          user: await Users.getOne(knex, { where: { name: 'GlaDos' } }),
          organisation: await CommunityBusinesses.getOne(knex, { where: { name: 'Aperture' } }),
        },
        scope: [],
      },
    });

    expect(res.result).toEqual({ is: false });
  });

  test('returns true when user is TWINE_ADMIN', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/foo',
      credentials: {
        user: {
          roles: [RoleEnum.TWINE_ADMIN],
          user: await Users.getOne(knex, { where: { name: 'GlaDos' } }),
          organisation: await CommunityBusinesses.getOne(knex, { where: { name: 'Aperture' } }),
        },
        scope: [],
      },
    });

    expect(res.result).toEqual({ is: true });
  });

  test('returns false when CB_ADMIN tries to access different organisation', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/foo',
      credentials: {
        user: {
          roles: [RoleEnum.CB_ADMIN],
          user: await Users.getOne(knex, { where: { name: 'Gordon' } }),
          organisation: await CommunityBusinesses.getOne(knex, { where: { name: 'Aperture' } }),
        },
        scope: [],
      },
    });

    expect(res.result).toEqual({ is: false });
  });
});
