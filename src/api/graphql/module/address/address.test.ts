import { AddressDbDataSource } from '@data/address';
import { resetDatabase } from '@data/db/seed/reset-database';
import { getSeedClient } from '@data/db/seed/seed-client';
import { UserDbDataSource } from '@data/user';
import { checkAddress } from '@test/checker.test';
import { createUser } from '@test/entity-seed.test';
import { requestMaker } from '@test/request-maker';
import { connectServer, connectDb } from '@test/utils/connect.util';
import { disconnectServer, disconnectDb } from '@test/utils/disconnect.util';
import Container from 'typedi';

describe('AddressResolver - Address', () => {
  const addressDatasource = Container.get(AddressDbDataSource);
  const userDatasource = Container.get(UserDbDataSource);
  const query = `
      query address($userId: Int!){
        address(userId: $userId) {
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

    await addressDatasource.insert(data.data);
    const address = await addressDatasource.insert(variables.data);

    const response = await requestMaker<any, { userId: number }>({ query, variables: { userId } });
    checkAddress(response.data.data.address[1], address);
  });
});
