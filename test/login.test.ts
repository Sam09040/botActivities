import { expect } from 'chai';
import axios from 'axios';
import server from '../src/app/graphql/server';
import { prisma } from '../src/app/client/client';
import 'dotenv/config';
import bcrypt from 'bcrypt';

describe('login mutation', () => {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
  before(async () => {
    try {
      await server.listen(port).then(async ({ url }) => {
        console.log(url);
      });
    } catch (error) {
      console.log(error.message);
    }

    try {
      await prisma.$connect();
    } catch (error) {
      console.log(error);
    }
    console.log(`listening on ${url}`);
    console.log('connected to testdb');

    await prisma.user.create({
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: await bcrypt.hash('Sam123', 10),
        birthDate: '09-04-2004',
      },
    });
  });

  after(async () => {
    if (server) {
      await server.stop();
      console.log('Server stopped');
    }

    await prisma.user.deleteMany();

    if (prisma) {
      await prisma.$disconnect();
      console.log('Database testdb disconnected');
    }
  });

  it('should return an error for invalid email', async () => {
    const mutation = `
            mutation login ($data: LoginInput!) {
                login (data: $data) {
                    user {
                        id,
                        name,
                        email,
                        birthDate
                    },
                    token
                }
            }
        `;

    const variables = {
      data: {
        email: 'sam@invalid.com',
        password: 'password123',
        rememberMe: true,
      },
    };

    try {
      await axios.post(url, { query: mutation, variables });
    } catch (err) {
      const graphqlError = err.response.data.errors[0];
      expect(graphqlError.message).to.equal('User not found!');
      expect(graphqlError.extensions.code).to.equal('404');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'email',
        reason: 'The email you provided does not exist.',
      });
    }
  });

  it('should return an error for wrong password', async () => {
    const mutation = `
            mutation login ($data: LoginInput!) {
                login (data: $data) {
                    user {
                        id,
                        name,
                        email,
                        birthDate
                    },
                    token
                }
            }
        `;

    const variables = {
      data: {
        email: 'sam@example.com',
        password: 'password123',
        rememberMe: true,
      },
    };

    try {
      await axios.post(url, { query: mutation, variables });
    } catch (err) {
      const graphqlError = err.response.data.errors[0];
      expect(graphqlError.message).to.equal('Wrong password.');
      expect(graphqlError.extensions.code).to.equal('400');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'password',
        reason: 'The provided password does not match.',
      });
    }
  });

  it('should return success and show the user and a token', async () => {
    const mutation = `
            mutation login ($data: LoginInput!) {
                login (data: $data) {
                    user {
                        id,
                        name,
                        email,
                        birthDate
                    },
                    token
                }
            }
        `;

    const variables = {
      data: {
        email: 'sam@example.com',
        password: 'Sam123',
        rememberMe: false,
      },
    };

    const response = await axios.post(url, { query: mutation, variables });
    const login = response.data.data.login;

    expect(response).to.have.property('status', 200);
    expect(login).to.have.property('token').that.is.a('string');
    expect(login.user.name).to.equal('Sam');
    expect(login.user.birthDate).to.equal('09-04-2004');
  });

  it('should return an error for missing token', async () => {
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
