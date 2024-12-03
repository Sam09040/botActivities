import { dbClient } from '../db/config/db.client';
import { UserInput } from '../interfaces';

export const createUser = async (user: UserInput) => {
  const { name, email, password, birthDate } = user.data;
  return dbClient.user.create({
    data: {
      name,
      email,
      password,
      birthDate,
    },
  });
};

export const countUsers = () => {
  return dbClient.user.count();
};

export const findAllUsers = (skip?: number, limit?: number) => {
  if (!limit) {
    limit = 10;
  }

  return dbClient.user.findMany({
    skip,
    take: limit,
    orderBy: {
      name: 'asc',
    },
  });
};

export const findUserById = (id: number) => {
  return dbClient.user.findUnique({ where: { id } });
};

export const findUserByEmail = (email: string) => {
  return dbClient.user.findUnique({ where: { email } });
};

export const deleteAllUsers = () => {
  return dbClient.user.deleteMany();
};
