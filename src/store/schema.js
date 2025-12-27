import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const stores = sqliteTable('store', {
  id: integer('id').primaryKey(),
  name: text('name'),
  address: text('address'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  currencyCode: text('currencyCode'),
  productsById: text('productsById', { mode: 'json' }),
  schedules: text('schedules', { mode: 'json' }),
  features: text('features', { mode: 'json' }),
  rate: real('rate'),
  rateCount: integer('rateCount'),
});
