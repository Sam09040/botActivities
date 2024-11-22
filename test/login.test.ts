import { expect } from 'chai';
import axios from 'axios';
import { prisma } from '../src/app/client/client';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { connectServer, connectDb } from './util/connect.util';
import { createUser } from './util/create.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';

describe('login mutation', () => {
  const port = process.env.PORT;
  const SECRET = process.env.JWT_SECRET ?? '';
  const url = `http://localhost:${port}/`;

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
    await  createUser(user);
    await connectDb();
  });

  after('End services', async () => {
    await disconnectServer();
    await prisma.user.deleteMany();
    await disconnectDb();
  });

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

    const user = await prisma.user.findUnique({ where: { email: 'sam@example.com' } });
    const login = response.data.data.login;
    expect(response).to.have.property('status', 200);
    expect(login).to.have.property('token').that.is.a('string');
    const isValid = jwt.verify(login.token, SECRET) as jwt.JwtPayload;
    const expiration = isValid.iat! + 60 * 60;
    expect(isValid).to.have.property('userId').that.is.a('number');
    expect(isValid.userId).to.equal(user?.id);
    expect(isValid.iat).to.be.closeTo(expiration, 5000);
    expect(login.user.name).to.equal('Sam');
    expect(login.user.birthDate).to.equal('09-04-2004');
  });
});
