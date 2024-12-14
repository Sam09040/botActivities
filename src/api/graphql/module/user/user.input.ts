import { UserInputModel } from '@domain/model';
import { IsEmail } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Infos to create an user' })
export class UserInput implements UserInputModel {
  @Field({ description: 'Name' })
  name: string;

  @Field({ description: 'Email' })
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @Field({ description: 'Password' })
  password: string;

  @Field({ description: 'Birth date' })
  birthDate: string;
}
