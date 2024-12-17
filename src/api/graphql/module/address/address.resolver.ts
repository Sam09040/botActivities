import { InvalidDataError } from '@core/error';
import { addressUseCase, createAddressUseCase } from '@domain/address';
import { AddressInputModel } from '@domain/model';

export const resolvers = {
  Query: {
    address: async (_: unknown, { userId }: { userId: number }) => addressUseCase(userId),
  },
  Mutation: {
    createAddress: async (_: unknown, { data }: any) => {
      const { cep, street, streetNumber, neighborhood, city, state } = data;
      if (!cep || !street || !streetNumber || !city || !state || !neighborhood) {
        throw new InvalidDataError('Invalid data received', {
          field: 'data',
          reason: 'All fields are required! (expect complement)',
        });
      }
      createAddressUseCase(data)
    },
  },
};
