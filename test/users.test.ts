import axios from 'axios';
import { expect } from 'chai';
import { connectServer, connectDb } from './util/connect.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';
import { getToken } from './util/get-token.util';
import { encryptPassword } from '../src/core/security/password';
import { deleteAllUsers, createUser } from '../src/data/user/user.db.datasource';
import { resetDatabase } from '../snaplet/seed/reset-database';
import { getSeedClient } from '../snaplet/seed/seed-client';
import { seedDb } from '../snaplet/seed/define-seed';
import { User } from '@prisma/client';
import { getAddresses } from '../src/data/address/address.db.datasource';

describe('users query', () => {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
  const query = `
  query users($skip: Int, $limit: Int){
    users(skip: $skip, limit: $limit) {
      users{
        id,
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
        },
        totalUsers,
        page,
        maxPage
      }
    }
  `;
  let token: string | undefined;
  let headers = {};
  let user: User;

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
    const userInfo = {
      data: {
        name: 'Sam de Almeida',
        email: 'sam@example.com',
        password: await encryptPassword('Sam123'),
        birthDate: '09-04-2004',
      },
    };
    user = await createUser(userInfo);
    token = await getToken(url);
  });
  afterEach('refresh db', async () => {
    await resetDatabase(await getSeedClient());
  });

  it('should return an error for no token', async () => {
    const variables = {
      skip: 0,
      limit: 10,
    };

    const response = await axios.post(url, { query, variables });
    const data = response.data;
    expect(data).to.have.property('errors');
    expect(data.errors[0].message).to.equal('Token is required for this operation!');
    expect(data.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
    expect(data.errors[0].extensions.field).to.equal('authorization');
    expect(data.errors[0].extensions.reason).to.equal('A valid token must be provided.');
    expect(data.errors[0].extensions.http_status).to.equal('400');
  });

  it('should return correct values when skip and limit are 0', async () => {
    headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    await seedDb();
    const variables = {
      skip: 40,
      limit: 0,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data).to.have.property('users');
    expect(data.users.length).to.equal(10);
    expect(data.users[2].id).to.equal(user.id.toString());
    expect(data.users[2].name).to.equal(user.name);
    expect(data.users[2].email).to.equal(user.email);
    expect(data.users[2].birthDate).to.equal(user.birthDate);
    expect(data.users[2]).to.have.property('addresses');
    expect(data.page).to.equal(4);
    expect(data.maxPage).to.equal(5);
    expect(data.totalUsers).to.equal(51);
  });

  it('should return correct values when limit is bigger than users amount', async () => {
    headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    await seedDb();
    const variables = {
      skip: 10,
      limit: 50,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data.users.length).to.equal(41);
    expect(data.maxPage).to.equal(1);
    expect(data.page).to.equal(1);
  });

  it('should return correct values when skip is bigger than users amount', async () => {
    headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    await seedDb(19);
    const variables = {
      skip: 20,
      limit: 5,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data.users.length).to.equal(0);
    expect(data.users).to.deep.equal([]);
    expect(data.totalUsers).to.equal(20);
    expect(data.page).to.equal(4);
    expect(data.maxPage).to.equal(4);
  });

  it('should return users with addresses', async () => {
    headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    await seedDb(10);
    const variables = {
      skip: 7,
      limit: 5,
    };
    
    const address = await getAddresses(1);
    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users.users;
    expect(data[2].name).to.equal(user.name);
    expect(data[2]).to.have.property('addresses');
    expect(data[2].addresses[0].cep).to.equal(address[0].cep);
    expect(data[2].addresses[0].street).to.equal(address[0].street);
    expect(data[2].addresses[0].streetNumber).to.equal(address[0].streetNumber);
    expect(data[2].addresses[0].complement).to.equal(address[0].complement);
    expect(data[2].addresses[0].neighborhood).to.equal(address[0].neighborhood);
    expect(data[2].addresses[0].city).to.equal(address[0].city);
    expect(data[2].addresses[0].state).to.equal(address[0].state);
  });

  it('should return an empty array for no users', async () => {
    headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    await deleteAllUsers();
    const variables = {
      skip: 0,
      limit: 0,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data.users).to.deep.equal([]);
    expect(data.totalUsers).to.equals(0);
    expect(data.page).to.equals(1);
    expect(data.maxPage).to.equals(0);
  });
});
