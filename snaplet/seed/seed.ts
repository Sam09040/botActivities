import { seedDb } from './define-seed';
import { resetDatabase } from './reset-database';
import { getSeedClient } from './seed-client';

await resetDatabase(await getSeedClient());
seedDb();
console.log('Seed finished successfully!');
