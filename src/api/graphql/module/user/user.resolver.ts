import { Arg, Authorized, Int, Mutation, Query, Resolver } from 'type-graphql';
import { User, Users } from './user.type';
import { PageInput } from '@graphql/common';
import { UserInput } from './user.input';
import { Login } from './login.type';
import { LoginInput } from './login.input';
import { Service } from 'typedi';
import { CreateUserUseCase, CreateManyUsersUseCase, LoginUseCase, UsersUseCase, UserUseCase } from '@domain/user';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@Service()
@Resolver()
export class UserResolver {
  constructor(
    private readonly userUseCase: UserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly usersUseCase: UsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createManyUsersUseCase: CreateManyUsersUseCase,
  ) {}

  @Query(() => String, { description: 'Hello test' })
  hello(): string {
    return 'hello';
  }

  @Query(() => User, { description: 'Get user by id' })
  @Authorized()
  user(@Arg('id', () => Int) id: number): Promise<User> {
    return this.userUseCase.exec(id);
  }

  @Query(() => Users, { description: 'Get users' })
  @Authorized()
  users(@Arg('pageInput') pageInput: PageInput): Promise<Users> {
    return this.usersUseCase.exec(pageInput);
  }

  @Mutation(() => User, { description: 'Create new user' })
  @Authorized()
  createUser(@Arg('data') data: UserInput): Promise<User> {
    return this.createUserUseCase.exec(data);
  }

  @Mutation(() => Login, { description: 'Authenticate user' })
  login(@Arg('data') data: LoginInput): Promise<Login> {
    return this.loginUseCase.exec(data);
  }

  @Mutation(() => String)
  async uploadCsv(@Arg('file', () => GraphQLUpload) file: FileUpload): Promise<string> {
    await this.createManyUsersUseCase.exec(file);
    return 'Upload ended successfully! Check the database to see the uploaded info.';
  }
}
