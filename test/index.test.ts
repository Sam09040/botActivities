import { expect } from 'chai';
import axios from 'axios';
import server from '../src/graphql/server';

before(async () => {
  try {
    await server.listen().then(async ({ url }) => {
      console.log(url);
    });
  } catch (error) {
    if(error instanceof Error) {
      console.error(`Error starting server: ${error.message}`);
    }
  }
});

after(async () => {
    if(server){
        await server.stop();   
        console.log('Server stopped');
    }
});

describe('Apollo Server', () => {
    it('should respond to hello query', async () => {
        const query = `
            query{
                hello
            }
        `;

        console.log("sending query...");
        const response = await axios.post('http://localhost:4000/', {
            query,
        });
        console.log('response received: ', response.data);
        

        expect(response.data.data.hello).to.equal('hello!');
    });
});
