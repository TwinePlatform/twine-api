/*
 * Community Business Admin Model
 */
import * as Knex from 'knex';
import { omit, pick, evolve } from 'ramda';
import { Dictionary } from '../types/internal';
import { User, UserCollection, UserChangeSet, ModelQuery, Organisation } from './types';
import { Users, ModelToColumn } from './user';
import { RoleEnum } from '../auth/types';
import { applyQueryModifiers } from './util';


/*
 * Declarations for methods specific to this model
 */
type CustomMethods = {
  recordLogin: (k: Knex, u: User) => Promise<void>
  fromOrganisation: (k: Knex, q: Partial<Organisation>) => Promise<User[]>
};

/*
 * Implementation of the UserCollection type for CbAdmin
 */
export const CbAdmins: UserCollection & CustomMethods = {
  create (a: Partial<User>): User {
    return Users.create(a);
  },

  toColumnNames (o: Partial<User>): Dictionary<any> {
    return Users.toColumnNames(o);
  },

  async get (client: Knex, q: ModelQuery<User> = {}) {
    const query = evolve({
      where: CbAdmins.toColumnNames,
      whereNot: CbAdmins.toColumnNames,
    }, q);

    return applyQueryModifiers(
      client
        .select(query.fields ? pick(query.fields, ModelToColumn) : ModelToColumn)
        .from('user_account')
        .leftOuterJoin('gender', 'user_account.gender_id', 'gender.gender_id')
        .leftOuterJoin('ethnicity', 'user_account.ethnicity_id', 'ethnicity.ethnicity_id')
        .leftOuterJoin('disability', 'user_account.disability_id', 'disability.disability_id')
        .leftOuterJoin(
          'user_account_access_role',
          'user_account.user_account_id',
          'user_account_access_role.user_account_id')
        .where({
          ['user_account_access_role.access_role_id']: client('access_role')
            .select('access_role_id')
            .where({ access_role_name: RoleEnum.ORG_ADMIN }),
        }),
      query
    );
  },

  async getOne (client: Knex, q: ModelQuery<User> = {}) {
    const res = await CbAdmins.get(client, { ...q, limit: 1 });
    return res[0] || null;
  },

  async exists (client: Knex, q: ModelQuery<User> = {}) {
    const res = await CbAdmins.getOne(client, q);
    return res !== null;
  },

  async add (client: Knex, u: UserChangeSet) {
    return Users.add(client, u);
  },

  async update (client: Knex, u: User, c: UserChangeSet) {
    return Users.update(client, u, c);
  },

  async destroy (client: Knex, u: Partial<User>) {
    return Users.destroy(client, u);
  },

  async fromOrganisation (client: Knex, o: Organisation) {
    return client
        .select(ModelToColumn)
        .from('user_account')
        .leftOuterJoin('gender', 'user_account.gender_id', 'gender.gender_id')
        .leftOuterJoin('ethnicity', 'user_account.ethnicity_id', 'ethnicity.ethnicity_id')
        .leftOuterJoin('disability', 'user_account.disability_id', 'disability.disability_id')
        .leftOuterJoin(
          'user_account_access_role',
          'user_account.user_account_id',
          'user_account_access_role.user_account_id')
        .where({
          'user_account.deleted_at': null,
          ['user_account_access_role.access_role_id']: client('access_role')
            .select('access_role_id')
            .where({ access_role_name: RoleEnum.ORG_ADMIN }),
          ['user_account_access_role.organisation_id']: o.id,
        });
  },

  async recordLogin (client: Knex, u: User) {
    return Users.recordLogin(client, u);
  },

  async serialise (user: User) {
    return omit(['password', 'qrCode'], user);
  },
};
