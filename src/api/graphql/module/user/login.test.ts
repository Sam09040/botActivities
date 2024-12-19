import 'reflect-metadata';
import { UserDbDataSource } from '@data/user';
import { requestMaker, checkError, checkLogin, createUser } from '@test';
import { connectServer, connectDb, disconnectServer, disconnectDb } from '@test/utils';
import Container from 'typedi';
import { LoginInputModel, LoginModel } from '@domain/model';

describe('UserResolver - Login', () => {
  const datasource = Container.get(UserDbDataSource);
  beforeAll(async () => {
    await connectServer();
    await connectDb();
    await createUser();
  });

  afterAll(async () => {
    await disconnectServer();
    datasource.deleteAll();
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
    const error = response.data.errors?.at(0);
    checkError(response, error?.code, error?.message, error?.additionalInfo);
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
    const error = response.data.errors?.at(0);
    checkError(response, error?.code, error?.message, error?.additionalInfo);
  });

  it('should return success and show the user and a token', async () => {
    const variables = {
      data: {
        email: 'sam@example.com',
        password: 'Sam123',
        rememberMe: false,
      },
    };

    const response = await requestMaker<{ login: LoginModel }, {data: LoginInputModel}>({ query: mutation, variables });
    const user = await datasource.findOneByEmail('sam@example.com');
    checkLogin(response.data.data?.login, user);
  });
});
