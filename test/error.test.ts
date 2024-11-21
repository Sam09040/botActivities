import { expect } from 'chai';
import axios from 'axios';
import 'dotenv/config';
import { connectDb, connectServer } from './util/connect.util';
import { createUser } from './util/create.util';
import { disconnectDb, disconnectServer } from './util/disconnect.util';
import prisma from '../src/app/client/client';

describe('createUser mutation error', () => {
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

  const headers = {
    'Content-Type': 'application/json',
    Authorization:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczMjA1ODQ1OSwiZXhwIjoxNzMyNjYzMjU5fQ.Nsg9qGnoVk78-6ghY59h70L3A1iLznZO_NpG0jOg3c0',
  }

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
    await connectDb();
    await createUser(user);
  });

  after('End services', async () => {
    await disconnectServer();
    await prisma.user.deleteMany();
    await disconnectDb();
  });


  it('should return an error for existing email', async () => {
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };

    const response = await axios.post(url, { query: mutation, variables }, { headers });
    const graphqlError = response.data.errors[0];
    expect(graphqlError.message).to.equal('Email already exists!');
    expect(graphqlError.code).to.equal('400');
    expect(graphqlError.additionalInfo).to.deep.equal({
      field: 'email',
      reason: 'The email you provided is already in use. Please choose a different email address.',
    });
  });

  it('should return an error for invalid password', async () => {
    const variables = {
      data: {
        name: 'Ben',
        email: 'ben@gmail.com',
        password: '123',
        birthDate: '20-10-2005',
      },
    };

      const response = await axios.post(url, { query: mutation, variables }, { headers });
      const graphqlError = response.data.errors[0];
      expect(graphqlError.message).to.equal(`Password doesn't fit requirements!`);
      expect(graphqlError.code).to.equal('401');
      expect(graphqlError.additionalInfo).to.deep.equal({
        field: 'password',
        reason: 'Password must be at least 6 characters long, have a least one letter and one digit!',
      });
    
  });

  it('should return an error for invalid input', async () => {
    const variables = {
      data: {
        name: '',
        email: 'ben@gmail.com',
        password: '123',
        birthDate: '20-10-2005',
      },
    };

      const response = await axios.post(url, { query: mutation, variables }, { headers });
      const graphqlError = response.data.errors[0];
      expect(graphqlError.message).to.equal('Invalid input!');
      expect(graphqlError.code).to.equal('400');
      expect(graphqlError.additionalInfo).to.deep.equal({
        field: 'data',
        reason: 'Name, email, password and birthDate are required!',
      });
    
  });

  it('should return an error for no users', async () => {
    await prisma.user.deleteMany();
    const query = `
            query users{
              users {
                id,
                name,
                birthDate,
                email
              }
            }
        `;

      const response = await axios.post(url, { query });
      const graphqlError = response.data.errors[0];
      expect(graphqlError.message).to.equal('Users not found!');
      expect(graphqlError.code).to.equal('404');
      expect(graphqlError.additionalInfo).to.deep.equal({
        field: 'User',
        reason: 'There are no users.',
      });
    
  });
});
