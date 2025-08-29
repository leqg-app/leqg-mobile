import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import * as Sentry from '@sentry/react-native';

import * as schema from './schema.js';
import { eq } from 'drizzle-orm';

let db;

export default async function initialize() {
  const opsqlite = open({ name: 'leqg', location: './leqg.sqlite' });
  db = drizzle(opsqlite);
}

export async function getStores() {
  try {
    return await db.select().from(schema.stores);
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
}

export async function setStores(stores) {
  try {
    await db.delete(schema.stores);
    await db.insert(schema.stores).values(stores);
  } catch (e) {
    Sentry.captureException(e);
  }
}

export async function setStore(store) {
  try {
    await db
      .update(schema.stores)
      .set(store)
      .where(eq(schema.stores.id, store.id));
  } catch (e) {
    Sentry.captureException(e);
  }
}

export { db };
