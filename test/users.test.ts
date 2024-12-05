import axios from 'axios';
import { expect } from 'chai';
import { connectServer, connectDb } from './util/connect.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';
import { seedUsers } from '../snaplet/seed/define-seed';
import { getSeedClient } from '../snaplet/seed/seed-client';
import { resetDatabase } from '../snaplet/seed/reset-database';
import { getToken } from './util/get-token.util';
import { encryptPassword } from '../src/data/graphql/password';
import { deleteAllUsers, createUser } from '../src/data/user/user.db.datasource';

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
        },
        totalUsers,
        page,
        maxPage
      }
    }
  `;
  let token: string | undefined;
  let headers = {};

  before('begin services', async () => {
    await connectServer();
    await connectDb();
  });
  after('end services', async () => {
    await disconnectServer();
    deleteAllUsers();
    await disconnectDb();
  });
  beforeEach('create main user', async () => {
    const user = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: await encryptPassword('Sam123'),
        birthDate: '09-04-2004',
      },
    };
    await createUser(user);
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
    await seedUsers();
    const variables = {
      skip: 0,
      limit: 0,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data).to.have.property('users');
    expect(data.users.length).to.equal(10);
    expect(data.users[4]).to.have.property('id');
    expect(data.users[0]).to.have.property('name');
    expect(data.users[1]).to.have.property('email');
    expect(data.users[2]).to.have.property('birthDate');
    expect(data.users[3]).to.not.have.property('password');
    expect(data.page).to.equal(1);
    expect(data.maxPage).to.equal(5);
    expect(data.totalUsers).to.equal(51);
  });

  it('should return correct values when limit is bigger than users amount', async () => {
    headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    await seedUsers();
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
    await seedUsers(19);
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

  it('should return an error for no users', async () => {
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
