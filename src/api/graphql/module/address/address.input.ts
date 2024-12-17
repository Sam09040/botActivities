import { AddressInputModel } from '@domain/model';
import { IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator';
import { Field, InputType, Int } from 'type-graphql';

@InputType({ description: 'Infos to create an address' })
export class AddressInput implements AddressInputModel {
  @Field(() => Int, { description: 'UserId' })
  userId: number;

  @Field({ description: 'Cep' })
  @Length(9, 9, { message: 'Cep must have 8 digits and follow this format: 00000-000' })
  cep: string;

  @Field({ description: 'Street' })
  @IsNotEmpty({ message: 'Street must not be empty' })
  @MaxLength(255, { message: 'Street must not exceed 255 characters' })
  street: string;

  @Field({ description: 'Street Number' })
  @IsNotEmpty({ message: 'Street number must not be empty' })
  @MaxLength(4, { message: 'Street number must not exceed 4 characters' })
  streetNumber: string;

  @Field({ description: 'Complement' })
  @IsOptional()
  @MaxLength(60, { message: 'Complement must not exceed 60 characters' })
  complement?: string;

  @Field({ description: 'Neighborhood' })
  @IsNotEmpty({ message: 'Neighborhood must not be empty' })
  @MaxLength(255, { message: 'Neighborhood must not exceed 255 characters' })
  neighborhood: string;

  @Field({ description: 'City' })
  @IsNotEmpty({ message: 'City must not be empty' })
  @MaxLength(255, { message: 'City must not exceed 255 characters' })
  city: string;

  @Field({ description: 'State' })
  @IsNotEmpty({ message: 'State must not be empty' })
  @MaxLength(255, { message: 'State must not exceed 255 characters' })
  state: string;
}
