import { AddressInputModel } from '@domain/model';
import { Field, InputType, Int } from 'type-graphql';

@InputType({ description: 'Infos to create an address' })
export class AddressInput implements AddressInputModel {
  @Field(() => Int, { description: 'User ID' })
  userId: number;

  @Field({ description: 'Cep' })
  cep: string;

  @Field({ description: 'Street' })
  street: string;

  @Field({ description: 'Street Number' })
  streetNumber: string;

  @Field({ description: 'Complement' })
  complement?: string;

  @Field({ description: 'Neighborhood' })
  neighborhood: string;

  @Field({ description: 'City' })
  city: string;

  @Field({ description: 'State' })
  state: string;
}
