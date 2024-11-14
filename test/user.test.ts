import { expect } from 'chai';
import axios from 'axios';
import server from '../src/index';
import { prisma } from '../src/app/client/client';
import 'dotenv/config';
import bcrypt from 'bcrypt';

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
  console.log('Connected to testdb');

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

describe('user query', () => {
  it('should return an error for no token', async () => {
    const query = `
              query user($userId: Int!){
                user(id: $userId) {
                  name,
                  email,
                  birthDate
                }
              }
            `;

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
    const query = `
              query user($userId: Int!){
                user(id: $userId) {
                  name,
                  email,
                  birthDate
                }
              }
            `;

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

  it('should return an error for id equal 0', async () => {
    const query = `
              query user($userId: Int!){
                user(id: $userId) {
                  name,
                  email,
                  birthDate
                }
              }
            `;

    const variables = {
      userId: 0,
    };

    try {
      await axios.post(url, { query, variables });
    } catch (error) {
      const err = error.response.data.errors[0];
      expect(err.message).to.equal('Invalid request!');
      expect(err.extensions.code).to.equal('400');
      expect(err.extensions.additionalInfo).to.deep.equal({
        field: 'id',
        reason: 'The id needs to be greater than 0!',
      });
    }
  });

  it.only('should return user', async () => {
    const query = `
              query user($userId: Int!){
                user(id: $userId) {
                  name,
                  email,
                  birthDate
                }
              }
            `;

    const user = await prisma.user.findUnique({ where: { email: 'sam@example.com' } });

    const variables = {
      userId: user?.id,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczMTM1OTE3NCwiZXhwIjoxNzMxOTYzOTc0fQ.NwKd2vWXAlhZX1qslae7Ark02AGm0jkSBbbMysiLrG0',
    };

    const response = await axios.post(url, { query, variables }, { headers });
    const data = response.data.data;
    expect(data).to.have.property('user');
    expect(data.user.name).to.equal('Sam');
    expect(data.user.email).to.equal('sam@example.com');
    expect(data.user.birthDate).to.equal('09-04-2004');
  });
});
