import { ApolloServer, gql } from 'apollo-server';
import { readFileSync } from 'fs';
const typeDefs = gql(readFileSync('./src/app/graphql/schema.graphql', 'utf8'));
import { resolvers } from './app/graphql/resolvers.js';
import 'dotenv/config';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default server;
console.log(process.env.PORT);

/* server.listen(process.env.PORT).then(async ({ url }) => {
  console.log(url);
}); */
