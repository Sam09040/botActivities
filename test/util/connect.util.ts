import { server } from '../../src/data/graphql/server';
import { dbClient } from '../../src/data/db/client';
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
    await dbClient.$connect();
    console.log('Connected to testdb');
  } catch (error) {
    console.log(error);
  }
};
