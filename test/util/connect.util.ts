import server from '../../src/app/graphql/server';
import prisma from '../../src/app/client/client';
import 'dotenv/config';
const port = process.env.PORT;

export const connectServer = async () => {
  try {
    const { url } = await server.listen(port);
    console.log(url);
  } catch (error) {
    console.log(error.message);
  }
};

export const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to testdb');
  } catch (error) {
    console.log(error);
  }
};
