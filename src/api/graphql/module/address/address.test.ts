import 'reflect-metadata';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { createUser, requestMaker, checkAddress } from '@test';
import { connectServer, connectDb, disconnectServer, disconnectDb, getToken } from '@test/utils';
import Container from 'typedi';
import { AddressModel } from '@domain/model';

describe('AddressResolver - Address', () => {
  const addressDatasource = Container.get(AddressDbDataSource);
  const userDatasource = Container.get(UserDbDataSource);
  const query = `
      query address {
        address {
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
    await userDatasource.deleteAll();
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
    await userDatasource.deleteAll();
  });

  it('should return 2 addresses', async () => {
    const data = {
      userId,
      cep: '12345-678',
      street: 'R. Existe',
      streetNumber: '123A',
      complement: 'T. Silveira, apt. 512',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
    };

    const variables = {
      userId,
      cep: '87654-321',
      street: 'R. Rua',
      streetNumber: '321',
      complement: '',
      neighborhood: 'Neigh',
      city: 'City',
      state: 'State',
    };

    await addressDatasource.insert(data);
    const address = await addressDatasource.insert(variables);

    const response = await requestMaker<{ address: AddressModel }, undefined>({
      query,
      token,
    });
    await checkAddress(response.data.data?.address[1], address);
  });
});
