import { expect } from 'chai';
import axios from 'axios';
import server from '../dist/index.js';
let serverInstance = server;

before(async () => {
    if(!server.listen()){
        serverInstance = await server.listen({ port: 4000 });
        console.log(serverInstance);        
    }
    console.log('Server started on port 4000');
});

after(async () => {
    if(serverInstance){
        await serverInstance.stop();   
        serverInstance = null;
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
