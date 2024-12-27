import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import Container from 'typedi';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { context } from './server.context';
import { errorFormatter } from './graphql-error.formatter';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './module/user/user.resolver';
import { AddressResolver } from './module/address/address.resolver';
import { AuthorizationMiddleware } from './auth.middleware';
import { graphqlUploadExpress } from 'graphql-upload-ts';
let server: ApolloServer;

export async function run() {
  const app = express();
  const httpServer = http.createServer(app);
  
  const schema = await buildSchema({
    resolvers: [UserResolver, AddressResolver],
    container: Container,
    authChecker: AuthorizationMiddleware,
    validate: true,
  });
  const port = Number(process.env.PORT);
  server = new ApolloServer({
    schema,
    formatError: errorFormatter,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    csrfPrevention: true,
  });

  await server.start();

  app.use(
    '/',
    cors({ origin: '*', credentials: true }),
    graphqlUploadExpress({
      maxFiles: 10,
    }),
    express.json(),
    expressMiddleware(server, {
      context,
    }),
  );

  app.listen(port);
  console.log(`Server ready at http://localhost:${port}/`);
  return server;
}

export function stop() {
  if (server) {
    server.stop();
  }
}
