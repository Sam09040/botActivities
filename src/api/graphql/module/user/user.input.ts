import { UserInputModel } from '@domain/model';
import { IsEmail, IsISO8601, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Infos to create an user' })
export class UserInput implements UserInputModel {
  @Field({ description: 'Name' })
  @IsNotEmpty({ message: 'Name must be provided' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @Field({ description: 'Email' })
  @IsNotEmpty({ message: 'Email must be provided' })
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @Field({ description: 'Password' })
  @IsNotEmpty({ message: 'Password must be provided' })
  @MinLength(6, { message: 'Name must be at least 6 characters long' })
  @MaxLength(255, { message: 'Password cannot exceed 255 characters' })
  password: string;

  @Field({ description: 'Birth date' })
  @IsNotEmpty({ message: 'Birth date must be provided' })
  @IsISO8601(undefined, { message: 'Birth date must follow this pattern: dd-MM-yyyy' })
  birthDate: string;
}
