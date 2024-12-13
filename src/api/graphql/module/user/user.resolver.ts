import { PageInputModel } from '@core/pagination';
import { LoginInputModel, UserInputModel, UserModel } from '@domain/model';
import { createUserUseCase, loginUseCase, usersUseCase, userUseCase } from '@domain/user';
import { ContextType } from '@graphql/context-type';

export const resolvers = {
  Query: {
    user: async (_: unknown, { id }: { id: number }, context: ContextType): Promise<UserModel> =>
      userUseCase(id, context.token),
    users: async (_: unknown, pageInput: PageInputModel, context: ContextType) =>
      usersUseCase(pageInput, context.token),
  },
  Mutation: {
    createUser: async (_: unknown, data: UserInputModel, context: ContextType): Promise<UserModel> =>
      createUserUseCase(data, context.token),
    login: async (_: unknown, input: LoginInputModel) => loginUseCase(input),
  },
};
