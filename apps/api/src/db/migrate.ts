import '../config/env.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('Applying migrations...');

  const migrationClient = postgres(connectionString, { 
    max: 1,
    onnotice: () => {},
  });
  const db = drizzle(migrationClient);

  try {
      // OLD: await migrate(db, { migrationsFolder: './apps/api/drizzle' });
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsFolder = path.resolve(__dirname, '../../drizzle');

    await migrate(db, { migrationsFolder });
    console.log('Migrations applied successfully');
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error('Error applying migrations:', error);
    await migrationClient.end();
    process.exit(1);
  }
};

runMigrations();

