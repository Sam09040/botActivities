import { UserDbDataSource } from '@data/user';
import { resetDatabase, getSeedClient } from '@data/db/seed';
import { requestMaker, checkError, checkLogin, createUser } from '@test';
import { connectServer, connectDb, disconnectServer, disconnectDb } from '@test/utils';
import Container from 'typedi';

describe('UserResolver - Login', () => {
  const datasource = Container.get(UserDbDataSource);
  before('Begin services', async () => {
    await connectServer();
    await connectDb();
    await createUser();
  });

  after('End services', async () => {
    await disconnectServer();
    await resetDatabase(await getSeedClient());
    await disconnectDb();
  });

  const mutation = `
    mutation login ($data: LoginInput!) {
      login (data: $data) {
        user {
          id,
          name,
          email,
          birthDate
        },
        token
      }
    }
  `;

  it('should return an error for invalid email', async () => {
    const variables = {
      data: {
        email: 'sam@invalid.com',
        password: 'password123',
        rememberMe: true,
      },
    };

    const response = await requestMaker({ query: mutation, variables });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for wrong password', async () => {
    const variables = {
      data: {
        email: 'sam@example.com',
        password: 'password123',
        rememberMe: true,
      },
    };

    const response = await requestMaker({ query: mutation, variables });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return success and show the user and a token', async () => {
    const variables = {
      data: {
        email: 'sam@example.com',
        password: 'Sam123',
        rememberMe: false,
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables });
    const user = await datasource.findOneByEmail('sam@example.com');
    checkLogin(response.data.data.login, user);
  });
});
