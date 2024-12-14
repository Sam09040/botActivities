import 'dotenv/config';
import { resolvers as userResolver } from './module/user/user.resolver';
import { resolvers as addressResolver } from './module/address/address.resolver';

export const resolvers = {
  Query: {
    hello: (): string => 'hello!',
    ...userResolver.Query,
    address: addressResolver.Query.address,
  },
  Mutation: {
    ...userResolver.Mutation,
    createAddress: addressResolver.Mutation.createAddress,
  },
};
