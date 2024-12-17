import { SeedClient } from '@snaplet/seed';

export const resetDatabase = async (seed: SeedClient) => {
  await seed.$resetDatabase();
};
