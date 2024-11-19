import prisma from '../client/client';
import { UserInput } from '../interfaces/user';
import { LoginInput } from '../interfaces/login';
import isPasswordValid from './password';
import bcrypt from 'bcrypt';
import { CustomError } from '../errors/CustomError';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { AuthenticationError } from 'apollo-server';
const JWT_SECRET = process.env.JWT_SECRET ?? '';

const comparePassword = async (password: string, hashedPassword: string) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const resolvers = {
  Query: {
    hello: () => 'hello!',
    users: async () => {
      const users = await prisma.user.findMany();

      if (!users.length) {
        throw new CustomError('404', 'Users not found!', {
          field: 'User',
          reason: 'There are no users.',
        });
      }

      return users;
    },
    user: async (_: unknown, { id }: { id: number }, { token }: any) => {
      if (!id) {
        throw new CustomError('400', 'Invalid request!', {
          field: 'id',
          reason: 'The id needs to be greater than 0!',
        });
      }

      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      }

      try {
        jwt.verify(token, JWT_SECRET);
      } catch (error) {
        throw new AuthenticationError('Token is invalid!', {
          http_status: '401',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      }

      const user = prisma.user.findUnique({
        where: { id: id },
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
    createUser: async (_: unknown, { data }: UserInput, { token }: any) => {
      const { name, email, password, birthDate } = data;

      if (!token) {
        throw new AuthenticationError('Token is required for this operation!', {
          http_status: '400',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      }

      try {
        jwt.verify(token, JWT_SECRET);
      } catch (error) {
        throw new AuthenticationError('Token is invalid!', {
          http_status: '401',
          field: 'authorization',
          reason: 'A valid token must be provided.',
        });
      }

      if (!name || !email || !password || !birthDate) {
        throw new CustomError('400', 'Invalid input!', {
          field: 'data',
          reason: 'Name, email, password and birthDate are required!',
        });
      }

      const existingEmail = await prisma.user.findUnique({
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
      }

      const user = await prisma.user.findUnique({ where: { email: email } });

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

export default resolvers;
