import { expect } from 'chai';
import axios from 'axios';
import server from '../src/index';
import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import 'dotenv/config';
import bcrypt from 'bcrypt';

describe('createUser mutation', () => {
    const port = process.env.PORT;
    const url = 'http://localhost:4000/'
    before(async () => {
        if(!server.listen()){
            server.listen(port).then( async ({ url }) => {
                console.log(url);
            })
        }
        if(!prisma.$connect()){
            await prisma.$connect();
            console.log('Connected to testdb');
        }
        console.log(`Connected to server on port ${port}'`);
        console.log('Connected to testdb');

        await prisma.user.create({
          data: {
            name: 'Sam',
            email: 'sam@example.com',
            password: await bcrypt.hash('Sam123', 10),
            birthDate: '2004-04-09'
          }
        });
    });

    after(async () => {
      const serverInstance = server;
      if(serverInstance){
        await serverInstance.stop();
        console.log('Server stopped');
      }
      await prisma.user.deleteMany();
      if(prisma){
        await prisma.$disconnect();
        console.log('Database testdb disconnected');
      }
    })

    it('should return an error for existing email', async () => {
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
                name: 'Sam',
                email: 'sam@example.com',
                password: 'sam123',
                birthDate: '2004-04-09'
            }
        };
        
        console.log('Sending query...');
        try {
          await axios.post(url, { query: mutation, variables, });
        } catch (error) {
          const graphqlError = error.response.data.errors[0];
          expect(graphqlError.message).to.equal('Email already exists!');
          expect(graphqlError.extensions.code).to.equal('400');
          expect(graphqlError.extensions.additionalInfo).to.deep.equal({ 
            field: 'email',
            reason: 'The email you provided is already in use. Please choose a different email address.'
          });
        }
      });
    
      it('should return an error for invalid password', async () => {
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
            name: 'Ben',
            email: 'ben@gmail.com',
            password: '123',
            birthDate: '2005-10-20'
          }
        }
        
        try{
          await axios.post(url, { query: mutation, variables });
        }catch(error) {
          const graphqlError = error.response.data.errors[0];
          expect(graphqlError.message).to.equal('Password doesn\'t fit requirements!');
          expect(graphqlError.extensions.code).to.equal('401');
          expect(graphqlError.extensions.additionalInfo).to.deep.equal({
            field: 'password',
            reason: 'Password must be at least 6 characters long, have a least one letter and one digit!'
          })
        }
      });

      it('should return an error for invalid input', async () => {
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
            name: '',
            email: 'ben@gmail.com',
            password: '123',
            birthDate: '2005-10-20'
          }
        }
        
        try{
          await axios.post(url, { query: mutation, variables });
        }catch(error) {
          const graphqlError = error.response.data.errors[0];
          expect(graphqlError.message).to.equal('Invalid input!');
          expect(graphqlError.extensions.code).to.equal('400');
          expect(graphqlError.extensions.additionalInfo).to.deep.equal({
            field: 'data',
            reason: 'Name, email, password and birthDate are required!'
          })
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
        
        try{
          await axios.post(url, { query });
        }catch(error) {
          const graphqlError = error.response.data.errors[0];
          expect(graphqlError.message).to.equal('Users not found!');
          expect(graphqlError.extensions.code).to.equal('404');
          expect(graphqlError.extensions.additionalInfo).to.deep.equal({
            field: 'User',
            reason: 'There are no users.'
          })
        }
      });
})