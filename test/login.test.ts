import { expect } from 'chai';
import axios from 'axios';
import server from '../src/app/graphql/server';
import { prisma } from '../src/app/client/client';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('login mutation', () => {
  const port = process.env.PORT;
  const SECRET = process.env.JWT_SECRET ?? '';
  const url = `http://localhost:${port}/`;

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

  before(async () => {
    try {
      await server.listen(port).then(async ({ url }: any) => {
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
    const isValid = jwt.verify(login.token, SECRET);
    expect(isValid).to.have.property('userId').that.is.a('number');
    expect(login.user.name).to.equal('Sam');
    expect(login.user.birthDate).to.equal('09-04-2004');
  });
});
