import { dbClient } from '@data/db/config';
import { stop } from '@graphql/graphql-server';

export const disconnectServer = async () => {
  await stop();
};

export const disconnectDb = async () => {
  if (dbClient) {
    await dbClient.$disconnect();
    console.log('Database testdb disconnected');
  }
};
