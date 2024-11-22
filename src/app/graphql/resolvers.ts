import prisma from '../client/client';
import { UserInput, LoginInput, User } from '../interfaces/';
import { isPasswordValid, comparePassword } from './password';
import bcrypt from 'bcrypt';
import { CustomError } from '../errors/CustomError';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { AuthenticationError } from 'apollo-server';
import ContextType from './context-type';
import { verifyToken } from '../client/validation';
const JWT_SECRET = process.env.JWT_SECRET ?? '';

export const resolvers = {
  Query: {
    hello: (): string => 'hello!',
    users: async (_: unknown, { end }: { end: number }, context: ContextType) => {
      const { token } = context;

      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      };

      verifyToken(token, JWT_SECRET);

      const users = await prisma.user.findMany();
      if (!users.length) {
        throw new CustomError('404', 'Users not found!', {
          field: 'User',
          reason: 'There are no users.',
        });
      };

      const sortUsers = (users: User[]): User[] => {
        return users.sort((a, b) => a.name.localeCompare(b.name));
      };

      let sortedUsers = sortUsers(users);

      if (!end) {
        end = 10;
        sortedUsers = sortedUsers.slice(0, end);
      } else {
        sortedUsers = sortedUsers.slice(0, end);
      };

      return sortedUsers;
    },
    user: async (_: unknown, { id }: { id: number }, context: ContextType) => {
      const { token } = context;
      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      };

      verifyToken(token, JWT_SECRET);

      const user = prisma.user.findUnique({
        where: { id },
      });
      if (user === null) {
        throw new CustomError('404', 'User not found!', {
          field: 'id',
          reason: 'The provided id does not exist.',
        });
      };

      return user;
    },
  },
  Mutation: {
    createUser: async (_: unknown, { data }: UserInput, context: ContextType) => {
      const { name, email, password, birthDate } = data;
      const { token } = context;
      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      };

      verifyToken(token, JWT_SECRET);

      if (!name || !email || !password || !birthDate) {
        throw new CustomError('400', 'Invalid input!', {
          field: 'data',
          reason: 'Name, email, password and birthDate are required!',
        });
      };

      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new CustomError('400', 'Email already exists!', {
          field: 'email',
          reason: 'The email you provided is already in use. Please choose a different email address.',
        });
      };

      if (!isPasswordValid(password)) {
        throw new CustomError('401', `Password doesn't fit requirements!`, {
          field: 'password',
          reason: 'Password must be at least 6 characters long, have a least one letter and one digit!',
        });
      };

      const newUser = await prisma.user.create({
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
      };

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new CustomError('404', 'Wrong email or password!', {
          field: 'email',
          reason: 'The email or password is incorrect.',
        });
      };

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new CustomError('400', 'Wrong email or password.', {
          field: 'password',
          reason: 'The email or password is incorrect.',
        });
      };
      let token = null;
      if (rememberMe) {
        token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1w' });
      } else {
        token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      };

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

export default resolvers;
