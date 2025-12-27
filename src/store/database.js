import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { eq } from 'drizzle-orm';

import * as schema from './schema.js';
import { logError } from '../utils/logError';

let db;

export default function initialize() {
  const opsqlite = open({ name: 'leqg', location: './leqg.sqlite' });
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
    await db.delete(schema.stores);
    await db.insert(schema.stores).values(stores);
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
