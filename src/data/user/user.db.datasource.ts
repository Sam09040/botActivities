import { Address, User } from '@prisma/client';
import { UserInput } from '../../domain/interfaces';
import { deleteAllAddresses } from '../address/address.db.datasource';
import { dbClient } from '../db/config/db.client';

export const createUser = async (user: UserInput): Promise<User> => {
  const { name, email, password, birthDate } = user.data;
  return dbClient.user.create({
    data: {
      name,
      email,
      password,
      birthDate,
    },
    include: {
      addresses: true,
    },
  });
};

export const countUsers = (): Promise<number> => {
  return dbClient.user.count();
};

export const updateUserAddress = async (address: Address): Promise<User> => {
  return dbClient.user.update({
    where: {
      id: address.userId,
    },
    data: {
      addresses: {
        connect: {
          id: address.id,
        },
      },
    },
    include: {
      addresses: true,
    },
  });
};

export const findAllUsers = (skip?: number, limit?: number): Promise<User[]> => {
  if (!limit) {
    limit = 10;
  }

  return dbClient.user.findMany({
    skip,
    take: limit,
    orderBy: {
      name: 'asc',
    },
    include: {
      addresses: true,
    },
  });
};

export const findUserById = (id: number) => {
  return dbClient.user.findUnique({ where: { id }, include: { addresses: true } });
};

export const findUserByEmail = (email: string) => {
  return dbClient.user.findUnique({ where: { email }, include: { addresses: true } });
};

export const deleteAllUsers = async () => {
  const addressExist = await dbClient.user.findFirst({ include: { addresses: true } });
  if (addressExist) {
    await deleteAllAddresses();
  }
  return dbClient.user.deleteMany();
};
