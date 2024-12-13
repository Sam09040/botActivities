import 'dotenv/config';
import { resolvers as userResolver } from './module/user/user.resolver';
import { resolvers as addressResolver } from './module/address/address.resolver';

export const resolvers = {
  Query: {
    hello: (): string => 'hello!',
    user: userResolver.Query.user,
    users: userResolver.Query.users,
    address: addressResolver.Query.address,
  },
  Mutation: {
    createUser: userResolver.Mutation.createUser,
    createAddress: addressResolver.Mutation.createAddress,
    login: userResolver.Mutation.login,
  },
};
