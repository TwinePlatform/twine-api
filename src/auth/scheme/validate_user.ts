import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { Users, User, Organisations, Organisation } from '../../models';
import { RoleEnum, AccessEnum, ResourceEnum, PermissionLevelEnum } from '../types';
import Roles from '../roles';
import Permissions from '../permissions';


type CreateScopeName = (a: {
  access: AccessEnum,
  resource: ResourceEnum,
  permissionLevel: PermissionLevelEnum,
}) => string;

const createScopeName: CreateScopeName = ({
  access,
  resource,
  permissionLevel,
}) =>
  `${resource}-${permissionLevel}:${access}`;

export type UserCredentials = {
  user: User
  organisation?: Organisation
  role: RoleEnum
  scope: string[]
};

type ValidateUser = (a: {userId: number, organisationId: number}, b: Hapi.Request)
  => Promise <{credentials?: UserCredentials, isValid: boolean } | Boom<null>>;

const validateUser: ValidateUser = async (decoded, request) => {
  try {
    const { knex } = request;
    const { userId, organisationId } = decoded;

    if (!userId || !organisationId) {
      return { isValid: false };
    }

    const [
      user,
      organisation,
      role,
    ] = await Promise.all([
      Users.getOne(knex, { where: { id: userId, deletedAt: null } }),
      Organisations.getOne(knex, { where: { organisationId, deletedAt: null } }),
      Roles.oneFromUser(knex, { userId, organisationId }),
    ]);

    const permissions = await Permissions.forRole(knex, { role });
    const scope = permissions.map(createScopeName);

    return {
      credentials: {
        user,
        organisation,
        role,
        scope,
      },
      isValid: Boolean(user && organisation && role),
    };

  } catch (error) {
    console.log(error);
    return Boom.badImplementation('Error with route authentication for users');
  }
};

export default validateUser;
