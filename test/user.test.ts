import 'dotenv/config';
import axios from 'axios';
import { expect } from 'chai';
import { connectServer, connectDb } from './util/connect.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';
import { createUser, deleteAll, findUserByEmail } from '../src/data/db/user';

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

  const user = {
    data: {
      name: 'Sam',
      email: 'sam@example.com',
      password: 'Sam123',
      birthDate: '09-04-2004',
    },
  };

  before('Begin services', async () => {
    await connectServer();
    await createUser(user);
    await connectDb();
  });
  after('End services', async () => {
    await disconnectServer();
    deleteAll();
    await disconnectDb();
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
    const user = await findUserByEmail('sam@example.com');

    const variables = {
      userId: user?.id,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczMjA1ODQ1OSwiZXhwIjoxNzMyNjYzMjU5fQ.Nsg9qGnoVk78-6ghY59h70L3A1iLznZO_NpG0jOg3c0',
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data;
    expect(data).to.have.property('user');
    expect(data.user.name).to.equal('Sam');
    expect(data.user.email).to.equal('sam@example.com');
    expect(data.user.birthDate).to.equal('09-04-2004');
  });
});
