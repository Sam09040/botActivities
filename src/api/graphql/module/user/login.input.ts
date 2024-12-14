import { LoginInputModel } from '@domain/model';
import { IsEmail } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Infos to login' })
export class LoginInput implements LoginInputModel {
  @Field({ description: 'E-mail' })
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @Field({ description: 'Password' })
  password: string;

  @Field({ description: 'Remember Me' })
  rememberMe: boolean;
}
