import * as Knex from 'knex';
import { getTrx } from '../../../../tests/utils/database';
import { PermissionLevelEnum, ResourceEnum, RoleEnum, AccessEnum } from '../../types';
import Permissions from '..';
const { getConfig } = require('../../../../config');


describe('Permisions Module', () => {
  let trx: Knex.Transaction;
  const config = getConfig(process.env.NODE_ENV);
  const knex = Knex(config.knex);

  afterAll(async () => {
    await knex.destroy();
  });

  beforeEach(async () => {
    trx = await getTrx(knex);
  });

  afterEach(async () => {
    await trx.rollback();
  });

  describe('::grantNew', () => {
    test('SUCCESS - Grant a role a permission entry that doesn\'t already exist', async () => {
      try {
        const [{ count: permissionsCount }] = await trx('permission')
          .select('')
          .count();
        const query = await Permissions.grantNew(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.CHILD,
          role: RoleEnum.VISITOR,
        });

        expect(query)
          .toEqual([{ access_role_id: 1, permission_id: Number(permissionsCount) + 1 }]);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('ERROR - Cannot grant a role a permission entry that already exists', async () => {
      expect.assertions(1);
      try {
        const query = await Permissions.grantNew(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.ALL,
          role: RoleEnum.VOLUNTEER,
        });
        expect(query).toBe(false);

      } catch (error) {
        expect(error.message).toBe('Permission already exists, please use grantExisting method');
      }
    });
  });

  describe('::grantExisting', () => {
    test('SUCCESS - Grant a role a permission entry that already exists', async () => {
      try {
        const [{ permission_id: permissionId }] = await trx('permission')
        .select('permission_id').where({
          permission_entity: ResourceEnum.CONSTANTS,
          access_type: AccessEnum.WRITE,
          permission_level: PermissionLevelEnum.ALL,
        });

        const query = await Permissions.grantExisting(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.WRITE,
          permissionLevel: PermissionLevelEnum.ALL,
          role: RoleEnum.VOLUNTEER,
        });
        expect(query)
          .toEqual(expect.arrayContaining([{ access_role_id: 2, permission_id: permissionId }]));
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('ERROR - Cannot grant a permission that doesn\'t already exist', async () => {
      expect.assertions(1);
      try {
        await Permissions.grantExisting(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.PARENT,
          role: RoleEnum.VISITOR,
        });
      } catch (error) {
        expect(error.message).toBe(
          'Permission entry or role does not exist, please use grantNew method');
      }
    });
    test('ERROR - Duplicate link between role and permission entry', async () => {
      expect.assertions(1);
      try {
          resource: ResourceEnum.CONSTANTS,
        await Permissions.grantExisting(trx, {
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.ALL,
          role: RoleEnum.VISITOR });
      } catch (error) {
        expect(error.message).toBe('Permission entry is already associated to this role');
      }
    });
  });

  describe('::revoke', () => {
    test('SUCCESS - deletes existing link between a permission entry and role', async () => {
      expect.assertions(1);
      try {
          resource: ResourceEnum.CONSTANTS,
        const query = await Permissions.revoke(trx, {
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.ALL,
          role: RoleEnum.VISITOR });
        expect(query).toBe(1);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });

    test('ERROR - cannot delete when permission entry and role are not linked', async () => {
      expect.assertions(1);
      try {
        const query = await Permissions.revoke(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.WRITE,
          permissionLevel: PermissionLevelEnum.ALL,
          role: RoleEnum.VOLUNTEER,
        });
        expect(query).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Permission entry is not linked to role');
      }
    });

    test('ERROR - cannot delete when permission entry does not exist', async () => {
      expect.assertions(1);
      try {
        await Permissions.revoke(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.CHILD,
          role: RoleEnum.VOLUNTEER,
        });
      } catch (error) {
        expect(error.message).toBe('Permission entry does not exist');
      }
    });
  });

  describe('::roleHas', () => {
    test('SUCCESS - returns false for non matching permissions & user', async () => {
      try {
        const query = await Permissions.roleHas(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.OWN,
          role: RoleEnum.VOLUNTEER,
        });
        expect(query).toBe(false);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('SUCCESS - returns true for matching permissions & user', async () => {
      try {
          resource: ResourceEnum.CONSTANTS,
        const query = await Permissions.roleHas(trx, {
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.ALL,
          role: RoleEnum.VISITOR });
        expect(query).toBe(true);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
  });

  describe('::userHas', () => {
    test('SUCCESS - returns false for non matching permissions & user', async () => {
      try {
        const query = await Permissions.userHas(trx, {
          resource: ResourceEnum.CONSTANTS,
          access: AccessEnum.WRITE,
          permissionLevel: PermissionLevelEnum.ALL,
          userId: 1,
        });
        expect(query).toBe(false);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
    test('SUCCESS - returns true for matching permissions & user', async () => {
      try {
          access: AccessEnum.READ,
          permissionLevel: PermissionLevelEnum.ALL,
          userId: 1 });
        const query = await Permissions.userHas(trx, {
          resource: ResourceEnum.VISIT_LOGS,
        expect(query).toBe(true);
      } catch (error) {
        expect(error).toBeFalsy();
      }
    });
  });

  describe('::forRole', () => {
    test('SUCCESS - returns all permissions associated with role', async () => {
      const result = await Permissions.forRole(trx, { role: RoleEnum.VISITOR });
      expect(result).toEqual([
        {
          access_role_id: 1,
          access_type: 'read',
          permission_entity: 'constants',
          permission_level: 'all',
        },
        {
          access_role_id: 1,
          access_type: 'read',
          permission_entity: 'visit_activies',
          permission_level: 'own',
        },
        {
          access_role_id: 1,
          access_type: 'write',
          permission_entity: 'user_details',
          permission_level: 'own',
        },
        {
          access_role_id: 1,
          access_type: 'read',
          permission_entity: 'user_details',
          permission_level: 'own',
        },
        {
          access_role_id: 1,
          access_type: 'write',
          permission_entity: 'visit_logs',
          permission_level: 'parent',
        }].map((x) => expect.objectContaining(x)));
    });

    test('ERROR - returns error if role id does not exist', async () => {
      expect.assertions(1);
      try {
        await trx('access_role')
          .del()
          .where({ access_role_name: RoleEnum.VISITOR });

        await Permissions.forRole(trx, { role: RoleEnum.VISITOR });
      } catch (error) {
        expect(error.message).toEqual('Role does not exist or has no associated permissions');
      }
    });
  });
});
