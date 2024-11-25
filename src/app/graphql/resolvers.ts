import { AuthenticationError } from 'apollo-server';
import { dbClient } from '../client/client';
import { UserInput, LoginInput, User } from '../interfaces/';
import { isPasswordValid, comparePassword } from './password';
import { CustomError } from '../errors/CustomError';
import { verifyToken } from '../client/validation';
import { ContextType } from './context-type';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const JWT_SECRET = process.env.JWT_SECRET ?? '';

export const resolvers = {
  Query: {
    hello: (): string => 'hello!',
    users: async (
      _: unknown,
      { skip, limit }: { skip: number | undefined; limit: number | undefined },
      context: ContextType,
    ) => {
      const { token } = context;

      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      }

      verifyToken(token, JWT_SECRET);

      const totalUsers = await dbClient.user.count();

      if (!totalUsers) {
        throw new CustomError('404', 'Users not found!', {
          field: 'User',
          reason: 'There are no users.',
        });
      }

      if (!limit) {
        limit = 10;
      }

      const paginatedUsers = await dbClient.user.findMany({
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      });

      const maxPage = Math.round(totalUsers / limit);
      let page;
      
      if (skip) {
        page = Math.round(skip / limit);
      } else {
        page = 1;
      }

      return {
        users: paginatedUsers,
        totalUsers,
        page,
        maxPage,
      };
    },
    user: async (_: unknown, { id }: { id: number }, context: ContextType) => {
      const { token } = context;
      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      }

      verifyToken(token, JWT_SECRET);

      const user = dbClient.user.findUnique({
        where: { id },
      });
      if (user === null) {
        throw new CustomError('404', 'User not found!', {
          field: 'id',
          reason: 'The provided id does not exist.',
        });
      }

      return user;
    },
  },
  Mutation: {
    createUser: async (_: unknown, { data }: UserInput, context: ContextType): Promise<User> => {
      const { name, email, password, birthDate } = data;
      const { token } = context;
      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      }

      verifyToken(token, JWT_SECRET);

      if (!name || !email || !password || !birthDate) {
        throw new CustomError('400', 'Invalid input!', {
          field: 'data',
          reason: 'Name, email, password and birthDate are required!',
        });
      }

      const existingEmail = await dbClient.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new CustomError('400', 'Email already exists!', {
          field: 'email',
          reason: 'The email you provided is already in use. Please choose a different email address.',
        });
      }

      if (!isPasswordValid(password)) {
        throw new CustomError('401', `Password doesn't fit requirements!`, {
          field: 'password',
          reason: 'Password must be at least 6 characters long, have a least one letter and one digit!',
        });
      }

      const newUser = await dbClient.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(password, 10),
          birthDate,
        },
      });
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      };
    },
    login: async (_: unknown, { data }: LoginInput) => {
      const { email, password, rememberMe } = data;

      if (!email || !password) {
        throw new CustomError('400', 'Invalid input!', {
          field: 'data',
          reason: 'Email and password are required!',
        });
      }

      const user = await dbClient.user.findUnique({ where: { email } });

      if (!user) {
        throw new CustomError('404', 'Wrong email or password!', {
          field: 'email',
          reason: 'The email or password is incorrect.',
        });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new CustomError('400', 'Wrong email or password.', {
          field: 'password',
          reason: 'The email or password is incorrect.',
        });
      }
      let token = null;
      if (rememberMe) {
        token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1w' });
      } else {
        token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        },
        token,
      };
    },
  },
};
