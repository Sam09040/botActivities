import { resetDatabase, getSeedClient } from '@data/db/seed';
import { UserDbDataSource } from '@data/user';
import { createUser, requestMaker, checkUser, checkError } from '@test';
import { connectServer, connectDb, getToken, disconnectServer, disconnectDb } from '@test/utils';

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
  const datasource = new UserDbDataSource();
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
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };
    const response = await requestMaker<any, any>({ query: mutation, variables, token });
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
    token = 'none';
    const variables = {
      data: {
        name: 'Jeff',
        email: 'email@example.com',
        password: 'password123',
        birthDate: '09-04-2004',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables, token });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for existing email', async () => {
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables, token });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for invalid password', async () => {
    const variables = {
      data: {
        name: 'Ben',
        email: 'ben@gmail.com',
        password: '123',
        birthDate: '20-10-2005',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables, token });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return an error for invalid input', async () => {
    const variables = {
      data: {
        name: '',
        email: 'ben@gmail.com',
        password: '123',
        birthDate: '20-10-2005',
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables, token });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });
});
