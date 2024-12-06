import { UserInput, LoginInput, User, Address } from '../../domain/interfaces';
import { ContextType } from './context-type';
import 'dotenv/config';
import { userQuery } from './query/user.query';
import { createUserMutation } from './mutation/create-user.mutation';
import { loginMutation } from './mutation/login.mutation';
import { usersQuery } from './query/users.query';
import { createAddressMutation } from './mutation/create-address.mutation';
import { addressQuery } from './query/address.query';

export const resolvers = {
  Query: {
    hello: (): string => 'hello!',
    users: async (
      _: unknown,
      { skip, limit }: { skip: number | undefined; limit: number | undefined },
      context: ContextType,
    ) => usersQuery(skip, limit, context.token),
    user: async (_: unknown, { id }: { id: number }, context: ContextType): Promise<User> => userQuery(id, context.token),
    address: async (_: unknown, { userId }: { userId: number }) => addressQuery(userId),
  },
  Mutation: {
    createUser: async (_: unknown, data: UserInput, context: ContextType): Promise<User> =>
      createUserMutation(data, context.token),
    createAddress: async (_: unknown, { userId, data }: { userId: number; data: Address }) =>
      createAddressMutation(userId, data),
    login: async (_: unknown, data: LoginInput) => loginMutation(data),
  },
};
