import { InvalidDataError } from '@core/error';
import { addressUseCase, createAddressUseCase } from '@domain/address';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Address } from './address.type';
import { AddressInput } from './address.input';
import { ServerContext } from '@graphql/server.context';

@Resolver()
export class AddressResolver {
  constructor() {}

  @Query(() => [Address], { description: 'Get addresses' })
  @Authorized()
  async address(@Ctx() { userId }: ServerContext) {
    return addressUseCase(userId);
  }

  @Mutation(() => Address, { description: 'Create a new address' })
  @Authorized()
  async createAddress(@Arg('data') data: AddressInput, @Ctx() { userId }: ServerContext) {
    data.userId = userId;
    return createAddressUseCase(data);
  }
}
