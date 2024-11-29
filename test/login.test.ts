import { expect } from 'chai';
import axios from 'axios';
import 'dotenv/config';
import { connectServer, connectDb } from './util/connect.util';
import { disconnectServer, disconnectDb } from './util/disconnect.util';
import { createUser, deleteAll, findUserByEmail } from '../src/data/db/user';
import { verifyToken } from '../src/data/validation/validation';
import { encryptPassword } from '../src/data/graphql/password';

describe('login mutation', () => {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;

  before('Begin services', async () => {
    const user = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: await encryptPassword('Sam123'),
        birthDate: '09-04-2004',
      },
    };
    await connectServer();
    await createUser(user);
    await connectDb();
  });

  after('End services', async () => {
    await disconnectServer();
    deleteAll();
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
      expect(graphqlError.message).to.equal('Wrong email or password');
      expect(graphqlError.extensions.code).to.equal('400');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'email or password',
        reason: 'The email or password is incorrect.',
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
      expect(graphqlError.message).to.equal('Wrong email or password.');
      expect(graphqlError.extensions.code).to.equal('400');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'email or password',
        reason: 'The email or password is incorrect.',
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

    const user = await findUserByEmail('sam@example.com');
    const login = response.data.data.login;
    expect(response).to.have.property('status', 200);
    expect(login).to.have.property('token').that.is.a('string');
    const isValid = verifyToken(login.token);
    const expiration = isValid.iat! + 60 * 60;
    expect(isValid).to.have.property('userId').that.is.a('number');
    expect(isValid.userId).to.equal(user?.id);
    expect(isValid.iat).to.be.closeTo(expiration, 5000);
    expect(login.user.name).to.equal(user?.name);
    expect(login.user.birthDate).to.equal(user?.birthDate);
  });
});
