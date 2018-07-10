import { permissionsInitialiser } from '../index';
import { getConfig } from '../../../../config';
import { migrate } from '../../../../database';
import * as knexInit from 'knex';

describe('Permisions Module', () => {
  const config = getConfig(process.env.NODE_ENV);
  const knex = knexInit(config.knex);
  beforeAll(async() => {
    await migrate.teardown();
    await knex.migrate.latest();
    await knex.seed.run();
  });

  describe('::grantNew', () => {
    test('SUCCESS - Grant a role a permission entry that doesn\'t already exist', async() => {
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.grantNew({
          resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          role:'VISITOR' });
        expect(query).toEqual(expect.arrayContaining([{ access_role_id: 1, permission_id: 1 }]));
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('ERROR - Cannot grant a role a permission entry that already exists', async() => {
      expect.assertions(1);
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.grantNew({
          resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          role:'VOLUNTEER' });
      } catch (error) {
        expect(error.message).toBe('Permission already exists, please use grantExisting method');
      }
    });
  });

  describe('::grantExisting', () => {
    test('SUCCESS - Grant a role a permission entry that already exists', async() => {
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.grantExisting({
          resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          role:'VOLUNTEER' });
        expect(query).toEqual(expect.arrayContaining([{ access_role_id: 2, permission_id: 1 }]));
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('ERROR - Cannot grant a permission that doesn\'t already exist', async() => {
      expect.assertions(1);
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.grantExisting({
          resource: 'constants',
          access:'read',
          permissionLevel: 'own',
          role:'VISITOR' });
      } catch (error) {
        expect(error.message).toBe('Permission entry does not exists, please use grantNew method');
      }
    });
    test('ERROR - Duplicate link between role and permission entry', async() => {
      expect.assertions(1);
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.grantExisting({
          resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          role:'VOLUNTEER' });
      } catch (error) {
        expect(error.message).toBe('Permission entry is already associated to this role');
      }
    });
  });

  describe('::revoke', () => {
    test('SUCCESS - deletes existing link between a permission entry and role', async() => {
      expect.assertions(1);
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.revoke({
          resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          role:'VOLUNTEER' });
        expect(query).toBe(1);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });

    test('ERROR - cannot delete when permission entry and role are not linked', async() => {
      expect.assertions(1);
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.revoke({
          resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          role:'VOLUNTEER' });
      } catch (error) {
        expect(error.message).toBe('Permission entry is not linked to role');
      }
    });
  });

  describe('::roleHas', () => {
    test('SUCCESS - returns false for non matching permissions & user', async() => {
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.roleHas({
          resource: 'constants',
          access:'read',
          permissionLevel: 'own',
          role:'VISITOR' });
        expect(query.exists).toBe(false);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('SUCCESS - returns true for matching permissions & user', async() => {
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.roleHas({
          resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          role:'VISITOR' });
        expect(query.exists).toBe(true);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
  });

  describe('::userHas', () => {
    test('SUCCESS - returns false for non matching permissions & user', async() => {
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.userHas({ resource: 'constants',
          access:'read',
          permissionLevel: 'own',
          userId:1 });
        expect(query.exists).toBe(false);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('SUCCESS - returns true for matching permissions & user', async() => {
      try {
        const permissionsInterface = permissionsInitialiser(config.knex);
        const query = await permissionsInterface.userHas({ resource: 'constants',
          access:'read',
          permissionLevel: 'child',
          userId:1 });
        expect(query.exists).toBe(true);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
  });
});
