import { expect } from 'chai';
import axios from 'axios';
import server from '../src/app/graphql/server';
import prisma from '../src/app/client/client';
import 'dotenv/config';

describe('createUser mutation', () => {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
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
    console.log(`Connected to database testdb`);
    console.log(`Server started on port ${port}`);
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

  it('should create an user successfully', async () => {
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };

    console.log('sending query...');
    const response = await axios.post(url, {
      query: mutation,
      variables,
    });
    const { data } = response.data;
    console.log('response received: ', data);

    expect(data).to.have.property('createUser');
    expect(data.createUser).to.have.property('id');
    expect(data.createUser.name).to.equal('Sam');
    expect(data.createUser.email).to.equal('sam@example.com');
    expect(data.createUser.birthDate).to.equal('09-04-2004');

    const userInDb = await prisma.user.findUnique({
      where: { email: 'sam@example.com' },
    });

    expect(userInDb).to.not.equal(null);
    expect(userInDb?.name).to.equal('Sam');
    console.log(userInDb?.name);
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
