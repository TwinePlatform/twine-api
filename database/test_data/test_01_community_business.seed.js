exports.seed = async (knex) => {
  await knex('organisation')
    .insert([
      {
        organisation_name: 'Aperture Science',
        _360_giving_id: 'GB-COH-3205',
      },
      {
        organisation_name: 'Black Mesa Research',
        _360_giving_id: 'GB-COH-9302',
      },
    ]);

  await knex('community_business')
    .insert([
      {
        organisation_id: knex('organisation').select('organisation_id').where({ organisation_name: 'Aperture Science'}),
        community_business_region_id: knex('community_business_region').select('community_business_region_id').where({ region_name: 'London' }),
        community_business_sector_id: knex('community_business_sector').select('community_business_sector_id').where({ sector_name: 'Housing' }),
        turnover_band: '£100k-£250k',
      },
      {
        organisation_id: knex('organisation').select('organisation_id').where({ organisation_name: 'Black Mesa Research'}),
        community_business_region_id: knex('community_business_region').select('community_business_region_id').where({ region_name: 'London' }),
        community_business_sector_id: knex('community_business_sector').select('community_business_sector_id').where({ sector_name: 'Housing' }),
        turnover_band: '£100k-£250k',
      }
    ]);
}
