import { ApolloServer, AuthenticationError, gql } from 'apollo-server';
import { readFileSync } from 'fs';
import { CustomError } from '../../core/errors/CustomError';
import { ContextType } from './context-type';
import { resolvers } from './resolvers';
const typeDefs = gql(readFileSync('./src/api/graphql/schema.graphql', 'utf8'));

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    if (err.originalError instanceof CustomError) {
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
  context: ({ req }): ContextType => {
    const token = req.headers.authorization ?? undefined;
    return { token };
  },
});
