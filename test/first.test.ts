import { expect } from 'chai';
import axios from 'axios';
import 'dotenv/config';
import { connectDb, connectServer } from './util/connect.util';
import { disconnectDb, disconnectServer } from './util/disconnect.util';
import { deleteAll, findUserByEmail } from '../src/data/db/user';

const port = process.env.PORT;
const url = `http://localhost:${port}/`;

describe('createUser mutation', () => {
  const mutation = `
            mutation createUser($data: UserInput!){
                createUser(data: $data) {
                    id,
                    name,
                    email,
                    birthDate
                }
            }
        `;

  before('before', async () => {
    await connectServer();
    await connectDb();
  });

  after('after', async () => {
    await disconnectServer();
    deleteAll();
    await disconnectDb();
  });

  it('should create an user successfully', async () => {
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'Sam123',
        birthDate: '09-04-2004',
      },
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczMjA1ODQ1OSwiZXhwIjoxNzMyNjYzMjU5fQ.Nsg9qGnoVk78-6ghY59h70L3A1iLznZO_NpG0jOg3c0',
    };

    const response = await axios.post(url, { query: mutation, variables }, { headers });
    const { data } = response.data;

    expect(data).to.have.property('createUser');
    expect(data.createUser).to.have.property('id');
    expect(data.createUser.name).to.equal('Sam');
    expect(data.createUser.email).to.equal('sam@example.com');
    expect(data.createUser.birthDate).to.equal('09-04-2004');

    const userInDb = await findUserByEmail('sam@example.com');

    expect(userInDb).to.not.equal(null);
    expect(userInDb?.name).to.equal('Sam');
  });

  it('should return an error for missing token', async () => {
    const variables = {
      data: {
        name: 'Jeff',
        email: 'email@example.com',
        password: 'password123',
        birthDate: '09-04-2004',
      },
    };

    const response = await axios.post(url, { query: mutation, variables });
    const data = response.data;
    expect(data).to.have.property('errors');
    expect(data.errors[0].message).to.equal('Token is required for this operation!');
    expect(data.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
    expect(data.errors[0].extensions.field).to.equal('authorization');
    expect(data.errors[0].extensions.reason).to.equal('A valid token must be provided.');
    expect(data.errors[0].extensions.http_status).to.equal('400');
  });

  it('should return an error for invalid token', async () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'none',
    };

    const variables = {
      data: {
        name: 'Jeff',
        email: 'email@example.com',
        password: 'password123',
        birthDate: '09-04-2004',
      },
    };

    const response = await axios.post(url, { query: mutation, variables }, { headers });
    const data = response.data;
    expect(data).to.have.property('errors');
    expect(data.errors[0].message).to.equal('Token is invalid!');
    expect(data.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
    expect(data.errors[0].extensions.field).to.equal('authorization');
    expect(data.errors[0].extensions.reason).to.equal('A valid token must be provided.');
    expect(data.errors[0].extensions.http_status).to.equal('401');
  });
});
