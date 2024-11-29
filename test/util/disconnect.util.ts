import { dbClient } from '../../src/data/db/client';
import { server } from '../../src/data/graphql/server';

export const disconnectServer = async () => {
  if (server) {
    await server.stop();
    console.log('Server stopped');
  }
};

export const disconnectDb = async () => {
  if (dbClient) {
    await dbClient.$disconnect();
    console.log('Database testdb disconnected');
  }
};
