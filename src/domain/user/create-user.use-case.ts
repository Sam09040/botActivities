import { InvalidDataError, UnauthorizedError } from '@core/error';
import { BcryptService } from '@core/security/bcrypt';
import { JwtService } from '@core/security/jwt';
import { UserDbDataSource } from '@data/user';
import { UserInputModel, UserModel } from '@domain/model';
import { ValidatePasswordUseCase } from './validate-password.use-case';

const datasource = new UserDbDataSource();
const jwtService = new JwtService();
const bcryptService = new BcryptService();

export async function createUserUseCase(input: UserInputModel, token: string | undefined): Promise<UserModel> {
  if (!token) {
    throw new UnauthorizedError('Token is required for this operation!', {
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  jwtService.verify(token);
  const { name, email, password, birthDate } = input;
  if (!name || !email || !password || !birthDate) {
    throw new InvalidDataError('Invalid input!', {
      field: 'data',
      reason: 'All fields are required!',
    });
  }

  const existingEmail = await datasource.findOneByEmail(email);

  if (existingEmail) {
    throw new InvalidDataError('Email already exists!', {
      field: 'email',
      reason: 'The email you provided is already in use. Please choose a different email address.',
    });
  }

  const isValid = ValidatePasswordUseCase.exec(password);
  if (isValid !== null) {
    throw new InvalidDataError(isValid, {
      field: 'password',
      reason: 'Password must be at least 6 characters long, have a least one letter and one digit!',
    });
  }

  const newUser = {
    name,
    email,
    password: await bcryptService.encrypt(password),
    birthDate,
  };

  const user = await datasource.insert(newUser);

  return user;
}
