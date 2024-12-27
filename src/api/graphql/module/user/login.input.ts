import { LoginInputModel } from '@domain/model';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Infos to login' })
export class LoginInput implements LoginInputModel {
  @Field(() => String, { description: 'E-mail' })
  @IsNotEmpty({ message: 'Email must be provided' })
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @Field(() => String, { description: 'Password' })
  @IsNotEmpty({ message: 'Password must be provided' })
  password: string;

  @Field(() => Boolean, { description: 'Remember Me' })
  rememberMe: boolean;
}
