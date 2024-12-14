import { InvalidDataError } from '@core/error';
import { addressUseCase, createAddressUseCase } from '@domain/address';
import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Address } from './address.type';
import { AddressInput } from './address.input';

@Resolver()
export class AddressResolver {
  constructor() {}

  @Query(() => [Address], { description: 'Get addresses' })
  async address(@Arg('userId', () => Int) userId: number) {
    return addressUseCase(userId);
  }

  @Mutation(() => Address, { description: 'Create a new address' })
  async createAddress(@Arg('data') data: AddressInput) {
    return createAddressUseCase(data);
  }
}
