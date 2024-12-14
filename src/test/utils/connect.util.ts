import { dbClient } from '@data/db/config';
import { run } from '@graphql';

export const connectServer = async () => {
  run();
};

export const connectDb = async () => {
  try {
    await dbClient.$connect();
    console.log('Connected to testdb');
  } catch (error) {
    console.log(error);
  }
};
