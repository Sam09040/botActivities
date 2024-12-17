import Container from 'typedi';
import { Seed } from './define-seed';
import { resetDatabase } from './reset-database';
import { getSeedClient } from './seed-client';

const run = async () => {
  await resetDatabase(await getSeedClient());
  Container.get(Seed).seedDb();
};

run();
console.log('Seed finished successfully!');
