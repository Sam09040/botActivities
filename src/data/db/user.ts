import { encryptPassword } from '../graphql/password';
import { UserInput } from '../interfaces';
import { dbClient } from './client';

export const createUser = async (user: UserInput) => {
  const { name, email, password, birthDate } = user.data;
  return dbClient.user.create({
    data: {
      name,
      email,
      password: await encryptPassword(password),
      birthDate,
    },
  });
};

export const findAllUsers = () => {
  return dbClient.user.findMany();
};

export const findUserById = (id: number) => {
  return dbClient.user.findUnique({ where: { id } });
};

export const findUserByEmail = (email: string) => {
  return dbClient.user.findUnique({ where: { email } });
};

export const deleteAll = () => {
  return dbClient.user.deleteMany();
};
