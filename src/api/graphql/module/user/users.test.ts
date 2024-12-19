import 'reflect-metadata';
import { expect } from 'chai';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { UserModel } from '@domain/model';
import { checkAddress, checkError, checkUser, requestMaker, createUser, createUsers, createAddresses, createAddress } from '@test';
import { disconnectServer, disconnectDb, connectServer, connectDb, getToken } from '@test/utils';
import Container from 'typedi';

describe('UserResolver - Users', () => {
  const userDatasource = Container.get(UserDbDataSource);
  const addressDatasource = Container.get(AddressDbDataSource);
  const query = `
  query users($input: PageInput!){
    users(pageInput: $input) {
      users {
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
  let user: UserModel;

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
    user = await createUser();
    await createAddress(user.id);
    token = await getToken(user);
  });
  afterEach(async () => {
    await userDatasource.deleteAll();
  });

  it('should return an error for no token', async () => {
    const variables = {
      input: {
        skip: 0,
        limit: 10,
      },
    };

    const response = await requestMaker({ query, variables });
    const error = response.data.errors?.at(0);
    checkError(response, error?.code, error?.message, error?.additionalInfo);
  });

  it('should return correct values when skip and limit are 0', async () => {
    await createUsers();
    const variables = {
      input: {
        skip: 40,
        limit: 0,
      },
    };

    const response = await requestMaker<any, any>({ query, variables, token });
    const data = response.data.data.users;
    checkUser(response.data.data.users.users[1], user);
    expect(data.page).to.equal(4);
    expect(data.maxPage).to.equal(5);
  });

  it('should return correct values when limit is bigger than users amount', async () => {
    await createUsers();
    const variables = {
      input: {
        skip: 10,
        limit: 50,
      },
    };

    const response = await await requestMaker<any, any>({ query, variables, token });
    const data = response.data.data.users;
    expect(data.users.length).to.equal(41);
    expect(data.maxPage).to.equal(2);
    expect(data.page).to.equal(1);
  });

  it('should return correct values when skip is bigger than users amount', async () => {
    await createUsers(19);
    const variables = {
      input: {
        skip: 20,
        limit: 5,
      },
    };

    const response = await requestMaker<any, any>({ query, variables, token });
    const data = response.data.data.users;
    expect(data.users.length).to.equal(0);
    expect(data.users).to.deep.equal([]);
    expect(data.page).to.equal(4);
    expect(data.maxPage).to.equal(4);
  });

  it.only('should return users with addresses', async () => {
    const users = await createUsers(10);
    const ids: number[] = [];
    users.forEach((user) => {
      ids.push(user.id);
    })
    await createAddresses(ids);
    const variables = {
      input: {
        skip: 7,
        limit: 5,
      },
    };

    const address = await addressDatasource.findAddresses(user.id);
    const response = await requestMaker<any, any>({ query, variables, token });
    const data = response.data.data.users.users;
    expect(data[2].name).to.equal(user.name);
    expect(data[2]).to.have.property('addresses');
    checkAddress(data[2].addresses[0], address[0]);
  });

  it('should return an empty array for no users', async () => {
    await userDatasource.deleteAll();
    const variables = {
      input: {
        skip: 0,
        limit: 0,
      },
    };

    const response = await requestMaker<any, any>({ query, variables, token });
    const data = response.data.data.users;
    expect(data.users).to.deep.equal([]);
    expect(data.page).to.equals(1);
    expect(data.maxPage).to.equals(0);
  });
});
