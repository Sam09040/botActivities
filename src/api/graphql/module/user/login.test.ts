import { connectServer, connectDb } from '@test/utils/connect.util';
import { disconnectServer, disconnectDb } from '@test/utils/disconnect.util';
import { requestMaker } from '@test/request-maker';
import { checkError, checkLogin } from '@test/checker.test';
import { LoginInputModel } from '@domain/model';
import { createUser } from '@test/entity-seed.test';
import { UserDbDataSource } from '@data/user';
import { resetDatabase } from '@data/db/seed/reset-database';
import { getSeedClient } from '@data/db/seed/seed-client';
const datasource = new UserDbDataSource();

describe('UserResolver - Login', () => {
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

    const response = await requestMaker<any, LoginInputModel>({ query: mutation, variables }, { token: 'none' });
    const user = await datasource.findOneByEmail('sam@example.com');
    checkLogin(response.data.data.login, user);
  });
});
