import { ApolloServer, AuthenticationError, gql } from 'apollo-server';
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
    if (err.originalError instanceof AuthenticationError) {
      const { message, extensions } = err.originalError;
      return {
        message,
        extensions,
      };
    }
    return err;
  },
  context: async ({ req }) => {
    const token = req.headers.authorization ?? null;
    return { token };
  },
});

export default server;
