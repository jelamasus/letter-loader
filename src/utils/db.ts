import knex from 'knex';
import settings from './settings.js';

export const QueryBuilder = knex({
  client: 'pg',
  connection: settings.SMTP_DB,
});
