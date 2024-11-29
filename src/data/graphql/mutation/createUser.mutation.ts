import { AuthenticationError } from 'apollo-server';
import { createUser, findUserByEmail } from '../../db/user';
import { verifyToken } from '../../validation/validation';
import { CustomError } from '../../errors/CustomError';
import { User, UserInput } from '../../interfaces';
import { encryptPassword, isPasswordValid } from '../password';

export const createUserMutation = async ({ data }: UserInput, token: string | undefined): Promise<User> => {
  const { name, email, password, birthDate } = data;

  if (!token) {
    throw new AuthenticationError('Token is required for this operation!', {
      http_status: '400',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  verifyToken(token);

  if (!name || !email || !password || !birthDate) {
    throw new CustomError('400', 'Invalid input!', {
      field: 'data',
      reason: 'Name, email, password and birthDate are required!',
    });
  }

  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw new CustomError('400', 'Email already exists!', {
      field: 'email',
      reason: 'The email you provided is already in use. Please choose a different email address.',
    });
  }

  if (!isPasswordValid(password)) {
    throw new CustomError('401', `Password doesn't fit requirements!`, {
      field: 'password',
      reason: 'Password must be at least 6 characters long, have a least one letter and one digit!',
    });
  }

  const newUser = {
    data: {
      name,
      email,
      password: await encryptPassword(password),
      birthDate,
    },
  };

  const user = await createUser(newUser);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
  };
};
