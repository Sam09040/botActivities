import { ApolloServer, AuthenticationError, gql } from 'apollo-server';
import { readFileSync } from 'fs';
import { ContextType } from './context-type';
import { resolvers } from './resolvers';
import { errorFormatter } from './graphql-error.formatter';
const typeDefs = gql(readFileSync('./src/api/graphql/schema.graphql', 'utf8'));
let server: ApolloServer;

export function run() {
  const port = process.env.PORT;
  server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: errorFormatter,
    context: ({ req }): ContextType => {
      const token = req.headers.authorization ?? undefined;
      return { token };
    },
  });

  server.listen(port).then(async ({ url }) => {
    console.log(url);
  });
}

export function stop() {
  if (server) {
    server.stop();
  }
}
