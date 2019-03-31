import * as Knex from 'knex';

const getOrgId = (k: Knex, s: string) =>
  k('organisation')
    .select('organisation_id')
    .where({ organisation_name: s });

exports.seed = async (knex: Knex) =>
  knex('volunteer_project')
    .insert([
      {
        volunteer_project_name: 'Party',
        organisation_id: getOrgId(knex, 'Black Mesa Research'),
      },
      {
        volunteer_project_name: 'Party',
        organisation_id: getOrgId(knex, 'Aperture Science'),
      },
      {
        volunteer_project_name: 'Community dinner',
        organisation_id: getOrgId(knex, 'Aperture Science'),
      },
      {
        volunteer_project_name: 'Take over the world',
        organisation_id: getOrgId(knex, 'Black Mesa Research'),
      },
    ]);
