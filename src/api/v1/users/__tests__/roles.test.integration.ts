import * as Hapi from 'hapi';
import * as Knex from 'knex';
import { init } from '../../../../server';
import { getConfig } from '../../../../../config';
import { User, Users, Organisation, Organisations } from '../../../../models';
import { Credentials } from '../../../../auth/strategies/standard';


describe('PUT /users/{userId}', () => {
  let server: Hapi.Server;
  let knex: Knex;
  let user: User;
  let organisation: Organisation;
  let credentials: Hapi.AuthCredentials;
  const config = getConfig(process.env.NODE_ENV);

  beforeAll(async () => {
    server = await init(config);
    knex = server.app.knex;

    user = await Users.getOne(knex, { where: { name: 'GlaDos' } });
    organisation = await Organisations.getOne(knex, { where: { name: 'Aperture Science' } });
    credentials = await Credentials.get(knex, user, organisation);
  });

  afterAll(async () => {
    await server.shutdown(true);
  });

  describe('GET /users/me/roles', () => {
    test('can get own roles', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/v1/users/me/roles',
        credentials,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({
        result: expect.objectContaining({ organisationId: organisation.id, role: 'CB_ADMIN' }),
      });
    });
  });
});
