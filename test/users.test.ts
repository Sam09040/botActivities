import axios from 'axios';
import { expect } from 'chai';
import { createUser, deleteAll } from '../src/data/db/user';
import { connectServer, connectDb } from './util/connect.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';
import { seedUsers } from '../snaplet/seed/define-seed';
import { getSeedClient } from '../snaplet/seed/seed-client';
import { resetDatabase } from '../snaplet/seed/reset-database';

describe.only('users query', () => {
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

  const headers = {
    'Content-Type': 'application/json',
    Authorization:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczMjI4MDc0OSwiZXhwIjoxNzMyODg1NTQ5fQ.huFREPUElN4d9cajXPdngDqSrBDMNDFYvmOVKk9GAMI',
  };

  const user = {
    data: {
      name: 'Sam',
      email: 'sam@example.com',
      password: 'Sam123',
      birthDate: '09-04-2004',
    },
  };

  before('begin services', async () => {
    await connectServer();
    await connectDb();
  });
  after('end services', async () => {
    await disconnectServer();
    deleteAll();
    await disconnectDb();
  });
  beforeEach('create main user', async () => {
    await createUser(user);
  });
  afterEach('refresh db', async () => {
    await resetDatabase(await getSeedClient(false));
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

  it('should return user, maxPage, page and totalUsers with their values', async () => {
    await seedUsers();
    const variables = {
      skip: 0,
      limit: 0,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data).to.have.property('users');
    expect(data.users.length).to.equal(10);
    expect(data.page).to.equal(0);
    expect(data.maxPage).to.equal(5);
    expect(data.totalUsers).to.equal(51);
  });

  it('should return correct values for page and users.length', async () => {
    await seedUsers();
    const variables = {
      skip: 10,
      limit: 8,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data).to.have.property('users');
    expect(data.users.length).to.equal(8);
    expect(data.page).to.equal(1);
    expect(data.maxPage).to.equal(6);
    expect(data.totalUsers).to.equal(51);
  });

  it('should return correct values for totalUsers, page and maxPage', async () => {
    await seedUsers(19);
    const variables = {
      skip: 10,
      limit: 0,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data.users;
    expect(data).to.have.property('users');
    expect(data.users.length).to.equal(10);
    expect(data.page).to.equal(1);
    expect(data.maxPage).to.equal(2);
    expect(data.totalUsers).to.equal(20);
  });

  it('should return an error for no users', async () => {
    await deleteAll();
    const variables = {
      skip: 0,
      limit: 0,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data;
    expect(data).to.have.property('errors');
    expect(data.errors[0].message).to.equal('No users found!');
    expect(data.errors[0].code).to.equal('404');
    expect(data.errors[0].additionalInfo).to.deep.equal({
      field: 'User',
      reason: 'There are no users.',
    });
  });
});
