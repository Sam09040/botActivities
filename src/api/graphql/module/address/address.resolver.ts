import { AddressUseCase, CreateAddressUseCase } from '@domain/address';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Address } from './address.type';
import { AddressInput } from './address.input';
import { ServerContext } from '@graphql/server.context';
import { Service } from 'typedi';

@Service()
@Resolver()
export class AddressResolver {
  constructor(
    private readonly addressUseCase: AddressUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
  ) {}

  @Query(() => [Address], { description: 'Get addresses' })
  @Authorized()
  async address(@Ctx() { userId }: ServerContext): Promise<Address[]> {
    return this.addressUseCase.exec(userId);
  }

  @Mutation(() => Address, { description: 'Create a new address' })
  @Authorized()
  async createAddress(@Arg('data') data: AddressInput, @Ctx() { userId }: ServerContext): Promise<Address> {
    data.userId = userId;
    return this.createAddressUseCase.exec(data);
  }
}
