import { UserInputModel } from '@domain/model';
import { IsEmail, IsNotEmpty, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Infos to create an user' })
export class UserInput implements UserInputModel {
  @Field(() => String, { description: 'Name' })
  @IsNotEmpty({ message: 'Name must be provided' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @Field(() => String, { description: 'Email' })
  @IsNotEmpty({ message: 'Email must be provided' })
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty({ message: 'Password must be provided' })
  @MinLength(6, { message: 'Name must be at least 6 characters long' })
  @MaxLength(255, { message: 'Password cannot exceed 255 characters' })
  password: string;

  @Field(() => String, { description: 'Birth date' })
  @IsNotEmpty({ message: 'The birth date must not be empty' })
  @Length(10, 10, { message: 'The birth date must have 10 characters' })
  @Matches(/[0-9]{2}-[0-9]{2}-[0-9]{4}/, { message: 'Birth date must be in the format dd-MM-yyyy' })
  birthDate: string;
}
