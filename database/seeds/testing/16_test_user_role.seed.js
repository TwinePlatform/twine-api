exports.seed = (knex) =>
  knex('user_account_access_role')
    .insert([
      { 
        user_account_id: knex('user_account').select('user_account_id').where({ user_name: 'Chell' }),
        organisation_id: knex('organisation').select('organisation_id').where({ organisation_name: 'Aperture Science' }),
        access_role_id: knex('access_role').select('access_role_id').where({ access_role_name: 'VISITOR' }),
      },
      { 
        user_account_id: knex('user_account').select('user_account_id').where({ user_name: 'GlaDos' }),
        organisation_id: knex('organisation').select('organisation_id').where({ organisation_name: 'Aperture Science' }),
        access_role_id: knex('access_role').select('access_role_id').where({ access_role_name: 'ORG_ADMIN' }),
      },
      {
        user_account_id: knex('user_account').select('user_account_id').where({ user_name: 'Gordon' }),
        organisation_id: knex('organisation').select('organisation_id'). where({ organisation_name: 'Aperture Science' }),
        access_role_id: knex('access_role').select('access_role_id').where({ access_role_name: 'ORG_ADMIN' }),
      }
  ]);
