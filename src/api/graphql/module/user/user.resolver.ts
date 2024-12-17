import { InvalidDataError, UnauthorizedError } from '@core/error';
import { PageInputModel } from '@core/pagination';
import { JwtService } from '@core/security/jwt';
import { LoginInputModel, UserInputModel, UserModel } from '@domain/model';
import { createUserUseCase, loginUseCase, usersUseCase, userUseCase } from '@domain/user';
import { ContextType } from '@graphql/context-type';
const jwtService = new JwtService();

const verification = (token: string) => {
  if(!token) {
    throw new UnauthorizedError('Token is required for this operation!', {
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }
  jwtService.verify(token);
}

export const resolvers = {
  Query: {
    user: async (_: unknown, { id }: { id: number }, context: ContextType): Promise<UserModel> => {
      verification(context.token);
      return userUseCase(id);
    },
    users: async (_: unknown, pageInput: PageInputModel, context: ContextType) => {
      verification(context.token);
      return usersUseCase(pageInput);
    },
  },
  Mutation: {
    createUser: async (_: unknown, data: UserInputModel, context: ContextType): Promise<UserModel> => {
      verification(context.token);
      const { name, email, password, birthDate } = data;
      if (!name || !email || !password || !birthDate) {
        throw new InvalidDataError('Invalid input!', {
          field: 'data',
          reason: 'All fields are required!',
        });
      }
      return createUserUseCase(data);
    },
    login: async (_: unknown, input: LoginInputModel) => {
      const { email, password } = input;
      if (!email || !password) {
        throw new InvalidDataError('Invalid email or password', {
          field: 'email or password',
          reason: 'You must provide a valid email and password',
        });
      }
      return loginUseCase(input);
    },
  },
};
