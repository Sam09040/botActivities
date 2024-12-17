import { resetDatabase, getSeedClient } from '@data/db/seed';
import { UserModel } from '@domain/model';
import { createAddress, createUser, requestMaker, checkAddress, checkError, checkUser } from '@test';
import { connectServer, connectDb, disconnectDb, disconnectServer, getToken } from '@test/utils';

describe('UserResolver - User', () => {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
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
  before('Begin services', async () => {
    await connectServer();
    await connectDb();
  });
  after('End services', async () => {
    await disconnectServer();
    await resetDatabase(await getSeedClient());
    await disconnectDb();
  });
  beforeEach('before each', async () => {
    user = await createUser();
  });
  afterEach('after each', async () => {
    await resetDatabase(await getSeedClient());
  });

  it('should return an error for no token', async () => {
    const variables = {
      userId: 1,
    };

    const response = await requestMaker({ query, variables });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for invalid token', async () => {
    const variables = {
      userId: 1,
    };

    const headers = {
      token: 'none',
    };

    const response = await requestMaker<any, any>({ query, variables }, headers);
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return user', async () => {
    token = await getToken(user);
    const variables = {
      userId: user.id,
    };

    const headers = {
      token,
    };

    const response = await requestMaker<any, any>({ query, variables }, headers);
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

    const headers = {
      token,
    };

    const response = await requestMaker<any, any>({ query, variables }, headers);
    checkUser(response.data.data.user, user);
    checkAddress(response.data.data.user.addresses[0], address);
  });
});
