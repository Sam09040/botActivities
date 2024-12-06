import 'dotenv/config';
import axios from 'axios';
import { expect } from 'chai';
import { connectServer, connectDb } from './util/connect.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';
import { getToken } from './util/get-token.util';
import { encryptPassword } from '../src/core/security/password';
import { createUser, deleteAllUsers } from '../src/data/user/user.db.datasource';
import { createAddress } from '../src/data/address/address.db.datasource';
import { User } from '@prisma/client';
import { resetDatabase } from '../snaplet/seed/reset-database';
import { getSeedClient } from '../snaplet/seed/seed-client';

describe('user query', () => {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
  const query = `
    query user($userId: Int!){
      user(id: $userId) {
        name,
        email,
        birthDate
      }
    }
  `;

  let token: string | undefined;
  let user: User;
  before('Begin services', async () => {
    await connectServer();
    await connectDb();
  });
  after('End services', async () => {
    await disconnectServer();
    await resetDatabase(await getSeedClient());
    await disconnectDb();
  });
  beforeEach('before each', async () => {
    const userInfo = {
      data: {
        name: 'Sam de Almeida',
        email: 'sam@example.com',
        password: await encryptPassword('Sam123'),
        birthDate: '09-04-2004',
      },
    };
    user = await createUser(userInfo);
  });
  afterEach('after each', async () => {
    await deleteAllUsers();
  });

  it('should return an error for no token', async () => {
    const variables = {
      userId: 1,
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

  it('should return an error for invalid token', async () => {
    const variables = {
      userId: 1,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'none',
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data;
    expect(data).to.have.property('errors');
    expect(data.errors[0].message).to.equal('Token is invalid!');
    expect(data.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
    expect(data.errors[0].extensions.field).to.equal('authorization');
    expect(data.errors[0].extensions.reason).to.equal('A valid token must be provided.');
    expect(data.errors[0].extensions.http_status).to.equal('401');
  });

  it('should return user', async () => {
    token = await getToken(url);
    const variables = {
      userId: user.id,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data;
    expect(data).to.have.property('user');
    expect(data.user.name).to.equal(user.name);
    expect(data.user.email).to.equal(user.email);
    expect(data.user.birthDate).to.equal(user.birthDate);
  });

  it('should return user and address', async () => {
    const query = `
    query user($userId: Int!) {
      user(id: $userId) {
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
      }
    }
  `;

    const addressInfo = {
      userId: user.id,
      data: {
        cep: '12345-678',
        street: 'R. Existe',
        streetNumber: '123A',
        complement: 'T. Silveira, apt. 512',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
      },
    };
    const address = await createAddress(addressInfo.userId, addressInfo.data);
    token = await getToken(url);
    const variables = {
      userId: user.id,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data;
    expect(data.user.name).to.equal(user.name);
    expect(data.user.email).to.equal(user.email);
    expect(data.user.birthDate).to.equal(user.birthDate);
    expect(data.user).to.have.property('addresses');
    expect(data.user.addresses[0].id).to.equal(address.id.toString());
    expect(data.user.addresses[0].cep).to.equal(address.cep);
    expect(data.user.addresses[0].street).to.equal(address.street);
    expect(data.user.addresses[0].streetNumber).to.equal(address.streetNumber);
    expect(data.user.addresses[0].complement).to.equal(address.complement);
    expect(data.user.addresses[0].neighborhood).to.equal(address.neighborhood);
    expect(data.user.addresses[0].city).to.equal(address.city);
    expect(data.user.addresses[0].state).to.equal(address.state);
  });
});
