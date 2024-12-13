import { addressUseCase, createAddressUseCase } from '@domain/address';
import { AddressInputModel } from '@domain/model';

export const resolvers = {
  Query: {
    address: async (_: unknown, { userId }: { userId: number }) => addressUseCase(userId),
  },
  Mutation: {
    createAddress: async (_: unknown, data: AddressInputModel) => createAddressUseCase(data),
  },
};
