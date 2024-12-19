import 'reflect-metadata';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { createUser, requestMaker, checkError, checkAddress } from '@test';
import { connectServer, connectDb, disconnectServer, disconnectDb, getToken } from '@test/utils';
import Container from 'typedi';
import { Address } from './address.type';
import { AddressInput } from './address.input';

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
  let token: string | undefined;

  beforeAll(async () => {
    await connectServer();
    await connectDb();
  });

  afterAll(async () => {
    await userDbDataSource.deleteAll();
    await disconnectServer();
    await disconnectDb();
  });

  beforeEach(async () => {
    const user = await createUser();
    if (user) {
      userId = user.id;
    }
    token = await getToken(user);
  });

  afterEach(async () => {
    await userDbDataSource.deleteAll();
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

    const response = await requestMaker({ query: mutation, variables, token });
    const error = response.data.errors?.at(0);
    checkError(response, error?.code, error?.message, error?.additionalInfo);
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
    const response = await requestMaker<{ createAddress: Address }, { data: AddressInput }>({
      query: mutation,
      variables,
      token,
    });
    const address = await addressDbDataSource.findAddresses(userId);
    checkAddress(response.data.data?.createAddress, address[0]);
  });
});
