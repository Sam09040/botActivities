import { InvalidDataError } from '@core/error';
import { addressUseCase, createAddressUseCase } from '@domain/address';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Address } from './address.type';
import { AddressInput } from './address.input';
import { ServerContext } from '@graphql/server.context';
import Container from 'typedi';

@Resolver()
export class AddressResolver {
  constructor(
    private readonly addressUseCase = Container.get(AddressUseCase),
    private readonly createAddressUseCase = Container.get(CreateAddressUseCase)
  ) {}

  @Query(() => [Address], { description: 'Get addresses' })
  @Authorized()
  async address(@Ctx() { userId }: ServerContext) {
    return this.addressUseCase.exec(userId);
  }

  @Mutation(() => Address, { description: 'Create a new address' })
  @Authorized()
  async createAddress(@Arg('data') data: AddressInput, @Ctx() { userId }: ServerContext) {
    data.userId = userId;
    return this.createAddressUseCase.exec(data);
  }
}
