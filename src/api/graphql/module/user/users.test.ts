import { expect } from 'chai';
import { resetDatabase } from '@data/db/seed/reset-database';
import { getSeedClient } from '@data/db/seed/seed-client';
import { seedDb } from '@data/db/seed/define-seed';
import { UserDbDataSource } from '@data/user';
import { AddressDbDataSource } from '@data/address';
import { UserModel } from '@domain/model';
import { connectServer, connectDb } from '@test/utils/connect.util';
import { disconnectServer, disconnectDb } from '@test/utils/disconnect.util';
import { getToken } from '@test/utils/get-token.util';
import { createUser } from '@test/entity-seed.test';
import { requestMaker } from '@test/request-maker';
import { checkAddress, checkError, checkUser } from '@test/checker.test';
const userDatasource = new UserDbDataSource();
const addressDatasource = new AddressDbDataSource();

describe('UserResolver - Users', () => {
  const query = `
  query users($input: PageInput!){
    users(input: $input) {
      users{
          id
          name
          email
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
        page
        maxPage
      }
    }
  `;
  let token: string | undefined;
  let headers = {};
  let user: UserModel;

  before('begin services', async () => {
    await connectServer();
    await connectDb();
  });
  after('end services', async () => {
    await resetDatabase(await getSeedClient());
    await disconnectServer();
    await disconnectDb();
  });
  beforeEach('create main user', async () => {
    user = await createUser();
    token = await getToken();
  });
  afterEach('refresh db', async () => {
    await resetDatabase(await getSeedClient());
  });

  it('should return an error for no token', async () => {
    const variables = {
      input: {
        skip: 0,
        limit: 10,
      },
    };

    const response = await requestMaker({ query, variables });
    const error = response.data.errors[0];
    checkError(response, error.code, error.message, error.additionalInfo);
  });

  it('should return correct values when skip and limit are 0', async () => {
    headers = {
      token,
    };
    await seedDb();
    const variables = {
      input: {
        skip: 40,
        limit: 0,
      },
    };

    const response = await requestMaker<any, any>({ query, variables }, headers);
    checkUser(response.data.data.users.users[1], user);
    const data = response.data.data.users;
    expect(data.page).to.equal(4);
    expect(data.maxPage).to.equal(5);
  });

  it('should return correct values when limit is bigger than users amount', async () => {
    headers = {
      token,
    };
    await seedDb();
    const variables = {
      input: {
        skip: 10,
        limit: 50,
      },
    };

    const response = await await requestMaker<any, any>({ query, variables }, headers);
    const data = response.data.data.users;
    expect(data.users.length).to.equal(41);
    expect(data.maxPage).to.equal(2);
    expect(data.page).to.equal(1);
  });

  it('should return correct values when skip is bigger than users amount', async () => {
    headers = {
      token,
    };
    await seedDb(19);
    const variables = {
      input: {
        skip: 20,
        limit: 5,
      },
    };

    const response = await requestMaker<any, any>({ query, variables }, headers);
    const data = response.data.data.users;
    expect(data.users.length).to.equal(0);
    expect(data.users).to.deep.equal([]);
    expect(data.page).to.equal(4);
    expect(data.maxPage).to.equal(4);
  });

  it('should return users with addresses', async () => {
    headers = {
      token,
    };
    await seedDb(10);
    const variables = {
      input: {
        skip: 7,
        limit: 5,
      },
    };

    const address = await addressDatasource.findAddresses(user.id);
    const response = await requestMaker<any, any>({ query, variables }, headers);
    const data = response.data.data.users.users;
    expect(data[2].name).to.equal(user.name);
    expect(data[2]).to.have.property('addresses');
    checkAddress(data[2], address[0]);
  });

  it('should return an empty array for no users', async () => {
    headers = {
      token,
    };
    await userDatasource.deleteAll();
    const variables = {
      input: {
        skip: 0,
        limit: 0,
      },
    };

    const response = await requestMaker<any, any>({ query, variables }, headers);
    const data = response.data.data.users;
    expect(data.users).to.deep.equal([]);
    expect(data.page).to.equals(1);
    expect(data.maxPage).to.equals(0);
  });
});
