import { prisma } from '../client/client';
import { UserInput } from '../interfaces';
import isPasswordValid from './password';
import bcrypt from 'bcrypt';

export const resolvers = {
  Query: {
    hello: () => 'hello!',
    users: async () => {
      const users = await prisma.user.findMany();

      if (!users.length) {
        return [];
      }

      return users;
    },
    user: async (_: unknown, { id }: { id: number }) => {
      const user = prisma.user.findUnique({
        where: { id: id },
      });

      if (!user) {
        throw new Error('User not found!');
      }

      return user;
    },
  },
  Mutation: {
    createUser: async (_: unknown, { data }: UserInput) => {
      if (!data) {
        throw new Error('Data is missing!');
      }

      const { name, email, password, birthDate } = data;

      const existingEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingEmail) {
        throw new Error('Email already exists!');
      }

      if (!isPasswordValid(password)) {
        throw new Error('Password must be at least 6 characters long, have a least one letter and one digit!');
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
