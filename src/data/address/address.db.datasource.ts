import { dbClient } from '../db/config/db.client';
import { Address } from '../../domain/interfaces';

export const createAddress = async (userId: number, address: Address) => {
  const { street, streetNumber, city, state, cep, neighborhood, complement } = address;
  return dbClient.address.create({
    data: {
      userId,
      street,
      streetNumber,
      city,
      state,
      cep,
      neighborhood,
      complement,
    },
  });
};

export const getAddresses = async (userId?: number) => {
  return dbClient.address.findMany({
    where: { userId },
  });
};

export const deleteAllAddresses = async () => {
  return dbClient.address.deleteMany();
};
