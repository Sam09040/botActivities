import { UserModel } from '@domain/model';
import { PageInfo } from '@graphql/common';
import { Field, Int, ObjectType } from 'type-graphql';
import { Address } from '../address/address.type';

@ObjectType()
export class User implements UserModel {
  @Field(() => Int, { description: 'User id' })
  id: number;

  @Field(() => String, { description: 'User name' })
  name: string;

  @Field(() => String, { description: 'User email' })
  email: string;

  @Field(() => String, { description: 'User birth date' })
  birthDate: string;

  @Field(() => [Address], { description: 'User addresses' })
  addresses: Address[];
}

@ObjectType()
export class Users implements PageInfo {
  @Field(() => [User], { description: 'User info' })
  users: User[];

  @Field(() => Int, { description: 'Page number' })
  page: number;

  @Field(() => Int, { description: 'Max number of pages' })
  maxPage: number;
}
