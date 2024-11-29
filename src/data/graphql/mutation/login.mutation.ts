import { findUserByEmail } from '../../db/user';
import { CustomError } from '../../errors/CustomError';
import { LoginInput } from '../../interfaces';
import { comparePassword } from '../password';
import { createToken } from '../../validation/token';

export const loginMutation = async ({ data }: LoginInput) => {
  const { email, password, rememberMe } = data;

  if (!email || !password) {
    throw new CustomError('400', 'Invalid input!', {
      field: 'data',
      reason: 'Email and password are required!',
    });
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new CustomError('400', 'Wrong email or password!', {
      field: 'email or password',
      reason: 'The email or password is incorrect.',
    });
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new CustomError('400', 'Wrong email or password.', {
      field: 'email or password',
      reason: 'The email or password is incorrect.',
    });
  }
  const token = createToken(rememberMe, user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
    },
    token,
  };
};
