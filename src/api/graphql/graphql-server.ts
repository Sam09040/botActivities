import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { context } from './server.context';
import { errorFormatter } from './graphql-error.formatter';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './module/user/user.resolver';
import { AddressResolver } from './module/address/address.resolver';
import { GraphQLError } from 'graphql';
import Container from 'typedi';
import { AuthorizationMiddleware } from './auth.middleware';
let server: ApolloServer;

export async function run() {
  const schema = await buildSchema({
    resolvers: [UserResolver, AddressResolver],
    container: Container,
    authChecker: AuthorizationMiddleware,
    validate: true
  });
  const port = Number(process.env.PORT);
  server = new ApolloServer({
    schema,
    formatError: errorFormatter,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context,
  });

  console.log(url);
}

export function stop() {
  if (server) {
    server.stop();
  }
}
