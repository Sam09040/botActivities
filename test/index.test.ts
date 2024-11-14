import { expect } from 'chai';
import axios from 'axios';
import server from '../src/app/graphql/server';
import prisma from '../src/app/client/client';
import 'dotenv/config';

describe('createUser mutation', () => {
  let serverInstance;
  const port = process.env.PORT;

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

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  after(async () => {
    serverInstance = server;
    if (serverInstance) {
      await serverInstance.stop();
      serverInstance = null;
      console.log('Server stopped');
    }
    if (prisma) {
      await prisma.$disconnect();
      console.log('Database testdb disconnected');
    }
  });

  it('should create an user successfully', async () => {
    const createUser = `
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
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };

    console.log('sending query...');
    const response = await axios.post(`http://localhost:${port}/`, {
      query: createUser,
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
});
