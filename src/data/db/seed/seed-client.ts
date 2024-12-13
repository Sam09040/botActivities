import { createSeedClient } from '@snaplet/seed';

export const getSeedClient = async (dryRun: boolean = false) => {
  return await createSeedClient({
    dryRun,
  });
};
