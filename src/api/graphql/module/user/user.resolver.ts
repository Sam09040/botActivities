import { ServerContext } from '@graphql/server.context';
import { Arg, Authorized, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { User, Users } from './user.type';
import { PageInput } from '@graphql/common';
import { UserInput } from './user.input';
import { Login } from './login.type';
import { LoginInput } from './login.input';
import Container, { Service } from 'typedi';
import { CreateUserUseCase, LoginUseCase, UsersUseCase, UserUseCase } from '@domain/user';

@Service()
@Resolver()
export class UserResolver {
  constructor(
    private readonly userUseCase = Container.get(UserUseCase),
    private readonly loginUseCase = Container.get(LoginUseCase),
    private readonly usersUseCase = Container.get(UsersUseCase),
    private readonly createUserUseCase = Container.get(CreateUserUseCase)
  ) {}

  @Query(() => String, { description: 'Hello test' })
  hello() {
    return 'hello';
  }

  @Query(() => User, { description: 'Get user by id' })
  @Authorized()
  async user(@Arg('id', () => Int) id: number, @Ctx() context: ServerContext) {
    return await this.userUseCase?.exec(id, context.token);
  }

  @Query(() => Users, { description: 'Get users' })
  @Authorized()
  users(@Arg('pageInput') pageInput: PageInput, @Ctx() context: ServerContext) {
    return this.usersUseCase.exec(pageInput, context.token);
  }

  @Mutation(() => User, { description: 'Create new user' })
  @Authorized()
  createUser(@Arg('data') data: UserInput, @Ctx() context: ServerContext) {
    return this.createUserUseCase.exec(data, context.token);
  }

  @Mutation(() => Login, { description: 'Authenticate user' })
  login(@Arg('data') data: LoginInput) {
    return this.loginUseCase.exec(data);
  }
}
