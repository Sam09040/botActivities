import { ApolloServer, gql } from 'apollo-server';
import { UserInput } from './interfaces';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const typeDefs = gql(readFileSync('./src/schema.graphql', 'utf8'));

const prisma = new PrismaClient();

const isPasswordValid = (password: string): boolean => {
  const minLength = 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  return password.length >= minLength && hasLetter && hasDigit;
};

const resolvers = {
  Query: {
    test: () => "it's working!",
    users: async () => {
      const users = await prisma.user.findMany();

      if (!users) {
        return null;
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

      const existingEmail = await prisma.user.findFirst({
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(async ({ url }) => {
  console.log(url);
});
