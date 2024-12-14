import { createUserUseCase, loginUseCase, usersUseCase, userUseCase } from '@domain/user';
import { ServerContext } from '@graphql/server.context';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { User, Users } from './user.type';
import { PageInput } from '@graphql/common';
import { UserInput } from './user.input';
import { Login } from './login.type';
import { LoginInput } from './login.input';

@Resolver()
export class UserResolver {
  constructor() {}

  @Query(() => String, { description: 'Hello test' })
  hello() {
    return 'hello';
  }

  @Query(() => User, { description: 'Get user by id' })
  user(@Arg('id', () => Int) id: number, @Ctx() context: ServerContext) {
    return userUseCase(id, context.token);
  }

  @Query(() => Users, { description: 'Get users' })
  users(@Arg('pageInput') pageInput: PageInput, @Ctx() context: ServerContext) {
    return usersUseCase(pageInput, context.token);
  }

  @Mutation(() => User, { description: 'Create new user' })
  createUser(@Arg('data') data: UserInput, @Ctx() context: ServerContext) {
    return createUserUseCase(data, context.token);
  }

  @Mutation(() => Login, { description: 'Authenticate user' })
  login(@Arg('data') data: LoginInput) {
    return loginUseCase(data);
  }
}
