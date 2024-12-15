import { connectDb, connectServer } from '@test/utils/connect.util';
import { disconnectServer, disconnectDb } from '@test/utils/disconnect.util';
import { UserDbDataSource } from '@data/user';
import { AddressDbDataSource } from '@data/address';
import { getSeedClient } from '@data/db/seed/seed-client';
import { resetDatabase } from '@data/db/seed/reset-database';
import { checkAddress, checkError } from '@test/checker.test';
import { requestMaker } from '@test/request-maker';
import { createUser } from '@test/entity-seed.test';
import Container from 'typedi';

describe('AddressResolver - CreateAddress', () => {
  const userDbDataSource = Container.get(UserDbDataSource);
  const addressDbDataSource = Container.get(AddressDbDataSource);
  const mutation = `
    mutation createAddress($data: AddressInput!){
      createAddress(data: $data) {
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
  `;

  let userId: number;

  before('before', async () => {
    await connectServer();
    await connectDb();
  });

  after('after', async () => {
    await resetDatabase(await getSeedClient());
    await disconnectServer();
    await disconnectDb();
  });

  beforeEach('beforeEach', async () => {
    const user = await createUser();
    if (user) {
      userId = user.id;
    }
  });

  afterEach('after each', async () => {
    await userDbDataSource.deleteAll();
  });

  it('should return error for userId not provided', async () => {
    const variables = {
      data: {
        cep: '12345-678',
        street: 'R. Existe',
        streetNumber: '123A',
        complement: 'T. Silveira, apt. 512',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
        userId: 0,
      },
    };
    const response = await requestMaker({ query: mutation, variables });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return error for userId not existing', async () => {
    const variables = {
      data: {
        cep: '12345-678',
        street: 'R. Existe',
        streetNumber: '123A',
        complement: 'T. Silveira, apt. 512',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
        userId: userId + 1,
      },
    };

    const response = await requestMaker({ query: mutation, variables }, { token: 'none' });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return error for missing field', async () => {
    const variables = {
      data: {
        cep: '12345-678',
        street: '',
        streetNumber: '123A',
        complement: 'T. Silveira, apt. 512',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
        userId,
      },
    };

    const response = await requestMaker({ query: mutation, variables });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return success and show address', async () => {
    const variables = {
      data: {
        cep: '12345-678',
        street: 'R. Existe',
        streetNumber: '123A',
        complement: 'T. Silveira, apt. 512',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
        userId,
      },
    };

    const response = await requestMaker<any, any>({ query: mutation, variables });
    const address = await addressDbDataSource.findAddresses(userId);
    checkAddress(response.data.data.createAddress, address[0]);
  });
});
