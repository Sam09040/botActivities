import { UserInput, LoginInput, User } from '../interfaces';
import { ContextType } from './context-type';
import 'dotenv/config';
import { userQuery } from './query/user.query';
import { createUserMutation } from './mutation/createUser.mutation';
import { loginMutation } from './mutation/login.mutation';
import { usersQuery } from './query/users.query';

export const resolvers = {
  Query: {
    hello: (): string => 'hello!',
    users: async (
      _: unknown,
      { skip, limit }: { skip: number | undefined; limit: number | undefined },
      context: ContextType,
    ) => {
      const { token } = context;
      return usersQuery(skip, limit, token);
    },
    user: async (_: unknown, { id }: { id: number }, context: ContextType) => {
      const { token } = context;
      return userQuery(id, token);
    },
  },
  Mutation: {
    createUser: async (_: unknown, data: UserInput, context: ContextType): Promise<User> => {
      const { token } = context;
      return createUserMutation(data, token);
    },
    login: async (_: unknown, data: LoginInput) => {
      return loginMutation(data);
    },
  },
};
