import 'reflect-metadata';
import { UserDbDataSource } from '@data/user';
import { UserModel } from '@domain/model';
import { createAddress, createUser, requestMaker, checkAddress, checkError, checkUser } from '@test';
import { connectServer, connectDb, disconnectDb, disconnectServer, getToken } from '@test/utils';
import Container from 'typedi';
import { User } from './user.type';

describe('UserResolver - User', () => {
  const datasource = Container.get(UserDbDataSource);
  const query = `
    query user($userId: Int!){
      user(id: $userId) {
        name,
        email,
        birthDate
      }
    }
  `;
  let token: string | undefined;
  let user: UserModel;
  beforeAll(async () => {
    await connectServer();
    await connectDb();
  });
  afterAll(async () => {
    await disconnectServer();
    await datasource.deleteAll();
    await disconnectDb();
  });
  beforeEach(async () => {
    user = await createUser();
  });
  afterEach(async () => {
    await datasource.deleteAll();
  });

  it('should return an error for no token', async () => {
    const variables = {
      userId: 1,
    };

    const response = await requestMaker({ query, variables });
    const error = response.data.errors?.at(0);
    checkError(response, error?.code, error?.message, error?.additionalInfo);
  });

  it('should return an error for invalid token', async () => {
    const variables = {
      userId: 1,
    };

    token = '';

    const response = await requestMaker<any, any>({ query, variables, token });
    const error = response.data.errors?.at(0);
    checkError(response, error?.code, error?.message, error?.additionalInfo);
  });

  it('should return user', async () => {
    token = await getToken(user);
    const variables = {
      userId: user.id,
    };

    const response = await requestMaker<any, any>({ query, variables, token });
    checkUser(response.data.data.user, user);
  });

  it('should return user and address', async () => {
    const query = `
    query user($userId: Int!) {
      user(id: $userId) {
        name,
        email,
        birthDate
        addresses {
          id
          cep
          street
          streetNumber
          complement
          neighborhood
          city
          state
        }
      }
    }
  `;

    const addressInfo = {
      userId: user.id,
    };
    const address = await createAddress(addressInfo.userId);
    token = await getToken(user);
    const variables = {
      userId: user.id,
    };

    const response = await requestMaker<{ user: User }, { userId: number }>({ query, variables, token });
    checkUser(response.data.data?.user, user);
    checkAddress(response.data.data?.user.addresses[0], address);
  });
});
