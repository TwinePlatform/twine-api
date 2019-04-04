import * as Knex from 'knex';
import { Dictionary } from 'ramda';
import { Omit, Int } from '../types/internal';
import { User } from '../models';


/*
 * Enumerations
 */

export enum RoleEnum {
  VISITOR = 'VISITOR',
  VOLUNTEER = 'VOLUNTEER',
  VOLUNTEER_ADMIN = 'VOLUNTEER_ADMIN',
  CB_ADMIN = 'CB_ADMIN',
  FUNDING_BODY = 'FUNDING_BODY',
  TWINE_ADMIN = 'TWINE_ADMIN',
  SYS_ADMIN = 'SYS_ADMIN',
}

export enum AccessEnum {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
}

export enum ResourceEnum {
  CONSTANTS = 'constants',
  ORG_DETAILS = 'organisations_details',
  ORG_FEEDBACK = 'organisations_feedback',
  ORG_INVITATIONS = 'organisations_invitations',
  ORG_OUTREACH = 'organisations_outreach',
  ORG_SUBSCRIPTIONS = 'organisations_subscriptions',
  ORG_TRAINING = 'organisations_training',
  ORG_VOLUNTEERS = 'organisations_volunteers',
  USER_DETAILS = 'user_details',
  VISIT_ACTIVITIES = 'visit_activities',
  VISIT_LOGS = 'visit_logs',
  VOLUNTEER_LOGS = 'volunteer_logs',
}

export enum PermissionLevelEnum {
  OWN = 'own',
  CHILD = 'child',
  PARENT = 'parent',
  SIBLING = 'sibling',
  ALL = 'all',
}


/*
 * Input query types
 */

type QueryResponse = Dictionary<any>;
export type PermissionTuple = {
  permissionLevel: PermissionLevelEnum
  access: AccessEnum
  resource: ResourceEnum
};

type PermissionQuery = PermissionTuple & { role: RoleEnum };
type UserPermissionQuery = Omit<PermissionQuery, 'role'> & { userId: number };
type RolesPermissionQuery = { roles: RoleEnum[], accessMode?: 'full' | 'restricted' };

type RoleQuery = {
  role: RoleEnum
  userId: number
  organisationId: number
};
type RolesQuery = { role: RoleEnum | RoleEnum[], userId: number, organisationId: number };
type MoveRoleQuery = Omit<RoleQuery, 'role'> & { from: RoleEnum, to: RoleEnum };
type UserRoleQuery = Omit<RoleQuery, 'role'>;


/*
 * Module interfaces
 */

export type PermissionInterface = {
  grantExisting: (k: Knex, a: PermissionQuery) => Promise<QueryResponse>

  grantNew: (k: Knex, a: PermissionQuery) => Promise<QueryResponse>

  revoke: (k: Knex, a: PermissionQuery) => Promise<QueryResponse>

  roleHas: (k: Knex, a: PermissionQuery) => Promise<boolean>

  userHas: (k: Knex, a: UserPermissionQuery) => Promise<boolean>

  forRoles: (k: Knex, a: RolesPermissionQuery) => Promise<PermissionTuple[]>
};

export type RolesInterface = {
  add: (k: Knex, a: RoleQuery) => Promise<QueryResponse>

  remove: (k: Knex, a: RoleQuery) => Promise<QueryResponse>

  move: (k: Knex, a: MoveRoleQuery) => Promise<QueryResponse>

  userHas: (k: Knex, u: User, r: RoleEnum) => Promise<boolean>

  userHasAtCb: (k: Knex, a: RolesQuery) => Promise<boolean>

  fromUser: (k: Knex, a: User) => Promise<{organisationId: Int, role: RoleEnum}[]>

  fromUserWithOrg: (k: Knex, a: UserRoleQuery) => Promise<RoleEnum[]>

  toDisplay: (r: RoleEnum) => string
};
