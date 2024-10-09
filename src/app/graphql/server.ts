import { ApolloServer, gql } from 'apollo-server';
import { readFileSync } from 'fs';
const typeDefs = gql(readFileSync('./src/graphql/schema.graphql', 'utf8'));
import resolvers from './resolvers';

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

export default server;
