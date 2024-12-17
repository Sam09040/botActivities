import { connectDb, connectServer } from '@test/utils/connect.util';
import { disconnectDb, disconnectServer } from '@test/utils/disconnect.util';
import { getToken } from '@test/utils/get-token.util';
import { UserDbDataSource } from '@data/user';
import { resetDatabase } from '@data/db/seed/reset-database';
import { getSeedClient } from '@data/db/seed/seed-client';
import { requestMaker } from '@test/request-maker';
import { checkError, checkUser } from '@test/checker.test';
import { createUser } from '@test/entity-seed.test';
const datasource = new UserDbDataSource();

describe('UserResolver - CreateUser', () => {
  const mutation = `
    mutation createUser($data: UserInput!){
      createUser(data: $data) {
        id,
        name,
        email,
        birthDate
      }
    }
  `;
  let token: string | undefined;

  before('before', async () => {
    await connectServer();
    await connectDb();
    const user = await createUser();
    token = await getToken(user);
  });

  after('after', async () => {
    await disconnectServer();
    await resetDatabase(await getSeedClient());
    await disconnectDb();
  });

  it('should create an user successfully', async () => {
    await datasource.deleteAll();
    const headers = {
      token,
    };
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };
    const response = await requestMaker<any, any>({ query: mutation, variables }, headers);
    const user = await datasource.findOneByEmail('sam@example.com');
    checkUser(response.data.data.createUser, user);
  });

  it('should return an error for missing token', async () => {
    const variables = {
      data: {
        name: 'Jeff',
        email: 'email@example.com',
        password: 'password123',
        birthDate: '09-04-2004',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for invalid token', async () => {
    const headers = {
      token: 'none',
    };

    const variables = {
      data: {
        name: 'Jeff',
        email: 'email@example.com',
        password: 'password123',
        birthDate: '09-04-2004',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables }, headers);
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for existing email', async () => {
    const headers = {
      token,
    };
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables }, headers);
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for invalid password', async () => {
    const headers = {
      token,
    };
    const variables = {
      data: {
        name: 'Ben',
        email: 'ben@gmail.com',
        password: '123',
        birthDate: '20-10-2005',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables }, headers);
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for invalid input', async () => {
    const headers = {
      token,
    };
    const variables = {
      data: {
        name: '',
        email: 'ben@gmail.com',
        password: '123',
        birthDate: '20-10-2005',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables }, headers);
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });
});
