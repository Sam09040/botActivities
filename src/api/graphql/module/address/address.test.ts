import { AddressDbDataSource } from '@data/address';
import { resetDatabase, getSeedClient } from '@data/db/seed';
import { UserDbDataSource } from '@data/user';
import { createUser, requestMaker, checkAddress } from '@test';
import { connectServer, connectDb, disconnectServer, disconnectDb } from '@test/utils';
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

    await addressDatasource.insert(data);
    const address = await addressDatasource.insert(variables);

    const response = await requestMaker<any, { userId: number }>({ query, variables: { userId } });
    checkAddress(response.data.data.address[1], address);
  });
});
