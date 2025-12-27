import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { eq } from 'drizzle-orm';

import * as schema from './schema.js';
import { logError } from '../utils/logError';

let db;
let opsqlite;

export default function initialize() {
  opsqlite = open({ name: 'leqg', location: './leqg.sqlite' });
  db = drizzle(opsqlite);
}

export async function getStores() {
  try {
    return await db.select().from(schema.stores);
  } catch (error) {
    logError(error, { function: 'getStores' });
    return [];
  }
}

export async function setStores(stores) {
  try {
    const commands = [['DELETE FROM store']];
    const batchSize = 50;

    for (let i = 0; i < stores.length; i += batchSize) {
      const batch = stores.slice(i, i + batchSize);
      const insertSQL =
        'INSERT INTO store (id, name, address, latitude, longitude, currencyCode, productsById, schedules, features, rate, rateCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

      // Prepare values for batch insert
      const values = batch.map(store => [
        store.id,
        store.name,
        store.address,
        store.latitude,
        store.longitude,
        store.currencyCode,
        JSON.stringify(store.productsById),
        JSON.stringify(store.schedules),
        JSON.stringify(store.features),
        store.rate,
        store.rateCount,
      ]);

      commands.push([insertSQL, values]);
    }

    await opsqlite.executeBatch(commands);
  } catch (e) {
    logError(e, { function: 'setStores', storesCount: stores?.length });
  }
}

export async function setStore(store) {
  try {
    await db
      .update(schema.stores)
      .set(store)
      .where(eq(schema.stores.id, store.id));
  } catch (e) {
    logError(e, { function: 'setStore', storeId: store?.id });
  }
}

export { db };
