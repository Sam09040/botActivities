import axios from 'axios';
import { encryptPassword } from '../src/data/graphql/password';
import { connectDb, connectServer } from './util/connect.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';
import { expect } from 'chai';
import { createUser } from '../src/data/user/user.db.datasource';
import { getUserAddresses, createAddress } from '../src/data/address/address.db.datasource';
import { resetDatabase } from '../snaplet/seed/reset-database';
import { getSeedClient } from '../snaplet/seed/seed-client';

const port = process.env.PORT;
const url = `http://localhost:${port}/`;

describe('address testes', () => {
  const mutation = `
        mutation createAddress($userId: Int!, $data: AddressInput!){
            createAddress(userId: $userId, data: $data) {
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
    await disconnectServer();
    await disconnectDb();
  });

  beforeEach('beforeEach', async () => {
    const user = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: await encryptPassword('Sam123'),
        birthDate: '09-04-2004',
      },
    };
    const sam = await createUser(user);
    if (sam) {
      userId = sam.id;
    }
  });

  afterEach('after each', async () => {
    await resetDatabase(await getSeedClient());
  });

  it('should return error for userId not provided', async () => {
    const variables = {
      userId: 0,
      data: {
        cep: '41650-195',
        street: 'R. da Gratidão',
        streetNumber: '290F',
        complement: 'T. turquesa, apt 302',
        neighborhood: 'Piatã',
        city: 'Salvador',
        state: 'Bahia',
      },
    };

    const response = await axios.post(url, { query: mutation, variables });
    const res = response.data;
    expect(res).to.have.property('errors');
    expect(res.errors[0].message).to.equal('No user provided');
    expect(res.errors[0].code).to.equal('401');
    expect(res.errors[0].additionalInfo).to.deep.equal({
      field: 'userId',
      reason: 'A user ID is required to create an address.',
    });
  });

  it('should return error for userId not existing', async () => {
    const variables = {
      userId: userId + 1,
      data: {
        cep: '41650-195',
        street: 'R. da Gratidão',
        streetNumber: '290F',
        complement: 'T. turquesa, apt 302',
        neighborhood: 'Piatã',
        city: 'Salvador',
        state: 'Bahia',
      },
    };

    const response = await axios.post(url, { query: mutation, variables });
    const res = response.data;
    expect(res).to.have.property('errors');
    expect(res.errors[0].message).to.equal('User not found!');
    expect(res.errors[0].code).to.equal('404');
    expect(res.errors[0].additionalInfo).to.deep.equal({
      field: 'userId',
      reason: 'The user you provided does not exist.',
    });
  });

  it('should return error for missing field', async () => {
    const variables = {
      userId,
      data: {
        cep: '41650-195',
        street: '',
        streetNumber: '290F',
        complement: 'T. turquesa, apt 302',
        neighborhood: 'Piatã',
        city: 'Salvador',
        state: 'Bahia',
      },
    };

    const response = await axios.post(url, { query: mutation, variables });
    const res = response.data;
    expect(res).to.have.property('errors');
    expect(res.errors[0].message).to.equal('Invalid input!');
    expect(res.errors[0].code).to.equal('400');
    expect(res.errors[0].additionalInfo).to.deep.equal({
      field: 'data',
      reason: 'All fields are required!',
    });
  });

  it('should return success and show address', async () => {
    const variables = {
      userId,
      data: {
        cep: '41650-195',
        street: 'R. da Gratidão',
        streetNumber: '290F',
        complement: 'T. turquesa, apt 302',
        neighborhood: 'Piatã',
        city: 'Salvador',
        state: 'Bahia',
      },
    };

    const response = await axios.post(url, { query: mutation, variables });
    const res = response.data.data.createAddress;
    const address = await getUserAddresses(userId);
    expect(res.id).to.equal(address[0].id.toString());
    expect(res.cep).to.equal(address[0].cep);
    expect(res.street).to.equal(address[0].street);
    expect(res.streetNumber).to.equal(address[0].streetNumber);
    expect(res.complement).to.equal(address[0].complement);
    expect(res.neighborhood).to.equal(address[0].neighborhood);
    expect(res.city).to.equal(address[0].city);
    expect(res.state).to.equal(address[0].state);
  });

  it('should return 2 addresses', async () => {
    const data = {
      cep: '41650-195',
      street: 'R. da Gratidão',
      streetNumber: '290F',
      complement: 'T. turquesa, apt 302',
      neighborhood: 'Piatã',
      city: 'Salvador',
      state: 'Bahia',
    };

    const variables = {
      userId,
      data: {
        id: 0,
        userId: 0,
        cep: '12345-678',
        street: 'R. Existe',
        streetNumber: '123',
        complement: '',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
      },
    };

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

    await createAddress(variables.userId, data);
    await createAddress(variables.userId, variables.data);

    const response = await axios.post(url, { query, variables: { userId } });
    const res = response.data.data;
    expect(res.address.length).to.equal(2);
    expect(res.address[1].street).to.equal('R. Existe');
    expect(res.address[1].streetNumber).to.equal('123');
  });
});
