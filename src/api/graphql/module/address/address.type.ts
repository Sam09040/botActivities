import { AddressModel } from '@domain/model';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Address implements AddressModel {
  @Field(() => Int, { description: 'Address id' })
  id: number;

  @Field({ description: 'user id connected to the address' })
  userId: number;

  @Field({ description: 'Address cep' })
  cep: string;

  @Field({ description: 'Address street' })
  street: string;

  @Field({ description: 'Address street number' })
  streetNumber: string;

  @Field({ description: 'Address complement', nullable: true })
  complement?: string;

  @Field({ description: 'Address neighborhood' })
  neighborhood: string;

  @Field({ description: 'Address city' })
  city: string;

  @Field({ description: 'Address state' })
  state: string;
}
