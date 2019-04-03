import * as Knex from 'knex';
import { Map } from '../../src/types';
import { RoleEnum } from '../../src/auth';
const perms: PermissionsJsonConfig = require('../seeds/permissions.seed.json');


type PermissionsJsonConfig = {
  permissions: string[]
  permissionsForRoles: Map<RoleEnum, string[]>
};

const rx = new RegExp('[-:]');

const scopeToPermission = (permission: string) => {
  const [entity, permissionLevel, access] = permission.split(rx);
  return {
    permission_entity: entity,
    permission_level: permissionLevel,
    access_type: access,
  };
};

const accessRolePermissionsRows = (client: Knex) =>
  Object.entries(perms.permissionsForRoles)
    .reduce((acc, [role, permissions]) => {
      const rows = permissions
        .map((x) => ({
          access_role_id: client('access_role')
            .select('access_role_id')
            .where({ access_role_name: role }),
          permission_id: client('permission')
            .select('permission_id')
            .where(scopeToPermission(x)),
        }));

      return [...acc, ...rows];
    }, [] as { access_role_id: Knex.QueryBuilder, permission_id: Knex.QueryBuilder}[]);

const permissionRows = perms.permissions.map(scopeToPermission);

export {
  permissionRows,
  accessRolePermissionsRows,
};
