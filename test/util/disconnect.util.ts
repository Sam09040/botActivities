import prisma from '../../src/app/client/client';
import server from '../../src/app/graphql/server';

export const disconnectServer = async () => {
  if (server) {
    await server.stop();
    console.log('Server stopped');
  }
};

export const disconnectDb = async () => {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Database testdb disconnected');
  }
};
