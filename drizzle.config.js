import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/store/schema.js',
  out: './src/store/drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
