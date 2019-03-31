import * as Knex from 'knex';

exports.seed = (knex: Knex) =>
  knex('api_token')
    .insert([
      { api_token_name: 'testaccount',
        api_token_access: 'frontline',
        api_token: '$2a$12$ljINX3VanQvCEycBOqvfw.UDMd4DXiRwU23Z9Vw6IVu3TDOKbrXlm',
      },
      { api_token_name: 'testaccount2',
        api_token_access: 'frontline',
        api_token: '$2a$12$ljINX3VanQvCEycBOqvfw.UDMd4DXiRwU23Z9Vw6IVu3TDOKbrXuG',
      },
    ]);
