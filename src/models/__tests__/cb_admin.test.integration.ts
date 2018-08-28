import * as Knex from 'knex';
import { Dictionary } from 'ramda';
import { getConfig } from '../../../config';
import factory from '../../../tests/factory';
import { CbAdmin } from '..';
import { getTrx } from '../../../tests/database';


describe('CbAdmin model', () => {
  const config = getConfig(process.env.NODE_ENV);
  const knex = Knex(config.knex);
  const context: Dictionary<any> = {};

  afterAll(async () => {
    await knex.destroy();
  });

  beforeEach(async () => {
    await getTrx(context, knex);
  });

  afterEach(async () => {
    await context.trx.rollback();
  });

  describe('Read', () => {
    test('get :: returns only those users with a cb-admin role', async () => {
      const admins = await CbAdmin.get(knex);
      expect(admins).toHaveLength(1);
      expect(admins).toEqual([expect.objectContaining({ id: 2, name: 'Gordon' })]);
    });

    test('get :: fetch deleted users', async () => {
      const admins = await CbAdmin.get(knex, { whereNot: { deletedAt: null } });
      expect(admins).toHaveLength(1);
      expect(admins).toEqual([expect.objectContaining({ id: 2, name: 'Gordon' })]);
    });

    test('getOne :: returns first user with cb-admin role', async () => {
      const admin = await CbAdmin.getOne(knex);
      expect(admin).toEqual(expect.objectContaining({ id: 2, name: 'Gordon' }));
    });
  });

  describe('Write', () => {
    test('add :: create new record using minimal information', async () => {
      const changeset = await factory.build('cbAdmin');

      const admin = await CbAdmin.add(context.trx, changeset);

      expect(admin).toEqual(expect.objectContaining(changeset));
    });

    test('update :: non-foreign key column', async () => {
      const changeset = { email: 'newmail@foo.com' };
      const admin = await CbAdmin.getOne(context.trx, { where: { id: 2 } });

      const updatedAdmin = await CbAdmin.update(context.trx, admin, changeset);

      expect(updatedAdmin).toEqual(expect.objectContaining(changeset));
    });

    test('update :: foreign key column', async () => {
      const changeset = { disability: 'no' };
      const admin = await CbAdmin.getOne(context.trx, { where: { id: 2 } });

      const updatedAdmin = await CbAdmin.update(context.trx, admin, changeset);

      expect(updatedAdmin).toEqual(expect.objectContaining(changeset));
    });

    test('update :: failed update on foreign key column', async () => {
      expect.assertions(1);

      const changeset = { gender: 'non-existent' };
      const admin = await CbAdmin.getOne(context.trx, { where: { id: 2 } });

      try {
        await CbAdmin.update(context.trx, admin, changeset);
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});
