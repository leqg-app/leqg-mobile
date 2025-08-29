import { numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const stores = sqliteTable('store', {
  id: numeric('id').primaryKey(),
  name: text('name'),
  address: text('address'),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  currencyCode: text('currencyCode'),
  productsById: text('productsById', { mode: 'json' }),
  schedules: text('schedules', { mode: 'json' }),
  features: text('features', { mode: 'json' }),
  rate: numeric('rate'),
  rateCount: numeric('rateCount'),
});
