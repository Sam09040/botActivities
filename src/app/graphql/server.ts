import { ApolloServer, gql } from 'apollo-server';
import { readFileSync } from 'fs';
import { CustomError } from '../errors/CustomError';
const typeDefs = gql(readFileSync('./src/app/graphql/schema.graphql', 'utf8'));
import resolvers from './resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    if(err.originalError instanceof CustomError) {
      const { code, message, additionalInfo } = err.originalError;
      return {
        code,
        message,
        additionalInfo,
      };
    }

    return err;
  },
});

export default server;
