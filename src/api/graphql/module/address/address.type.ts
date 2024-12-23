import { AddressModel } from '@domain/model';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Address implements AddressModel {
  @Field(() => Int, { description: 'Address id' })
  id: number;

  @Field(() => Int, { description: 'user id connected to the address' })
  userId: number;

  @Field(() => String, { description: 'Address cep' })
  cep: string;

  @Field(() => String, { description: 'Address street' })
  street: string;

  @Field(() => String, { description: 'Address street number' })
  streetNumber: string;

  @Field(() => String, { description: 'Address complement', nullable: true })
  complement?: string | null | undefined;

  @Field(() => String, { description: 'Address neighborhood' })
  neighborhood: string;

  @Field(() => String, { description: 'Address city' })
  city: string;

  @Field(() => String, { description: 'Address state' })
  state: string;
}
