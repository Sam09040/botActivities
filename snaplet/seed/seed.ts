import { seedDb } from './define-seed';
import { resetDatabase } from './reset-database';
import { getSeedClient } from './seed-client';

await resetDatabase(await getSeedClient());
await seedDb();
console.log('Seed finished successfully!');
