import * as Hapi from 'hapi';
import { init } from '../../../../server';
import factory from '../../../../../tests/utils/factory';
import { getConfig } from '../../../../../config';
import { RoleEnum } from '../../../../auth/types';
const { migrate } = require('../../../../../database');


describe('POST /users/register/visitor', () => {
  let server: Hapi.Server;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  afterEach(async () => {
    await migrate.truncate({ client: server.app.knex });
    await server.app.knex.seed.run();
  });

  test('user already exists', async () => {
    const user = await factory.build('user');
    const res = await server.inject({
      method: 'POST',
      url: '/v1/users/register/visitor',
      payload: {
        organisationId: 1,
        name: 'Chell',
        gender: 'female',
        birthYear: 1988,
        email: '1498@aperturescience.com',
      },
      credentials: {
        user,
        scope: ['user_details-child:write'],
        role: RoleEnum.ORG_NON_ADMIN,
      },
    });

    expect(res.statusCode).toBe(409);
    expect((<any> res.result).error.message).toBe('User with this e-mail already registered');
  });

  test('non-existent community business', async () => {
    const user = await factory.build('user');
    const res = await server.inject({
      method: 'POST',
      url: '/v1/users/register/visitor',
      payload: {
        organisationId: 9352,
        name: 'foo',
        gender: 'female',
        birthYear: 1988,
        email: '13542@google.com',
      },
      credentials: {
        user,
        scope: ['user_details-child:write'],
        role: RoleEnum.ORG_NON_ADMIN,
      },
    });

    expect(res.statusCode).toBe(400);
    expect((<any> res.result).error.message).toBe('Unrecognised organisation');
  });

  test('no registered ORG_ADMIN', async () => {
    /*
     * Organisation 2 (Black Mesa Research) has an ORG_ADMIN (Gordon) who is
     * marked as deleted, and therefore will not be fetched from the DB
     */
    const user = await factory.build('user');
    const res = await server.inject({
      method: 'POST',
      url: '/v1/users/register/visitor',
      payload: {
        organisationId: 2,
        name: 'foo',
        gender: 'female',
        birthYear: 1988,
        email: '13542@google.com',
      },
      credentials: {
        user,
        scope: ['user_details-child:write'],
        role: RoleEnum.ORG_NON_ADMIN,
      },
    });

    expect(res.statusCode).toBe(422);
    expect((<any> res.result).error.message).toBe('No associated admin for this organisation');
  });

  test('happy path', async () => {
    const user = await factory.build('user');
    const res = await server.inject({
      method: 'POST',
      url: '/v1/users/register/visitor',
      payload: {
        organisationId: 1,
        name: 'foo',
        gender: 'female',
        birthYear: 1988,
        email: '13542@google.com',
      },
      credentials: {
        user,
        scope: ['user_details-child:write'],
        role: RoleEnum.ORG_NON_ADMIN,
      },
    });

    expect(res.statusCode).toBe(200);
    expect((<any> res.result).data).toEqual(expect.objectContaining({
      name: 'foo',
      gender: 'female',
      birthYear: 1988,
      email: '13542@google.com',
    }));
  });
});
