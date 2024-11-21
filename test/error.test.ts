import { expect } from 'chai';
import axios from 'axios';
import 'dotenv/config';
import StartFinish from './start-finish.test';

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

  const user = {
    data: {
      name: 'Sam',
      email: 'sam@example.com',
      password: 'Sam123',
      birthDate: '09-04-2004',
    },
  };

  StartFinish(user);

  it('should return an error for existing email', async () => {
    const variables = {
      data: {
        name: 'Sam',
        email: 'sam@example.com',
        password: 'sam123',
        birthDate: '09-04-2004',
      },
    };

    try {
      await axios.post(url, { query: mutation, variables });
    } catch (error) {
      const graphqlError = error.response.data.errors[0];
      expect(graphqlError.message).to.equal('Email already exists!');
      expect(graphqlError.extensions.code).to.equal('400');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'email',
        reason: 'The email you provided is already in use. Please choose a different email address.',
      });
    }
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

    try {
      await axios.post(url, { query: mutation, variables });
    } catch (error) {
      const graphqlError = error.response.data.errors[0];
      expect(graphqlError.message).to.equal(`Password doesn't fit requirements!`);
      expect(graphqlError.extensions.code).to.equal('401');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'password',
        reason: 'Password must be at least 6 characters long, have a least one letter and one digit!',
      });
    }
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

    try {
      await axios.post(url, { query: mutation, variables });
    } catch (error) {
      const graphqlError = error.response.data.errors[0];
      expect(graphqlError.message).to.equal('Invalid input!');
      expect(graphqlError.extensions.code).to.equal('400');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'data',
        reason: 'Name, email, password and birthDate are required!',
      });
    }
  });

  it('should return an error for no users', async () => {
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

    try {
      await axios.post(url, { query });
    } catch (error) {
      const graphqlError = error.response.data.errors[0];
      expect(graphqlError.message).to.equal('Users not found!');
      expect(graphqlError.extensions.code).to.equal('404');
      expect(graphqlError.extensions.additionalInfo).to.deep.equal({
        field: 'User',
        reason: 'There are no users.',
      });
    }
  });
});
