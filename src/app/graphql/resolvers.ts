import { prisma } from '../client/client';
import { UserInput } from '../interfaces';
import isPasswordValid from './password';
import bcrypt from 'bcrypt';
import { CustomError } from '../errors/CustomError';

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
    user: async (_: unknown, { id }: { id: number }) => {
      const user = prisma.user.findUnique({
        where: { id: id },
      });
      if (user == null) {
        throw new CustomError('404', 'User not found!', {
          field: 'id',
          reason: 'The provided id does not exist.',
        });
      }

      return user;
    },
  },
  Mutation: {
    createUser: async (_: unknown, { data }: UserInput) => {
      if (!data) {
        throw new CustomError('400', 'Data is missing!', {
          field: 'data',
          reason: 'You need to input data!',
        });
      }

      const { name, email, password, birthDate } = data;

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
  },
};

export default resolvers;
