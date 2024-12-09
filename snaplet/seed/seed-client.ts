import { createSeedClient } from '@snaplet/seed';

export const getSeedClient = async (dryRun?: boolean) => {
  return await createSeedClient({
    dryRun,
  });
};
