import bcrypt from 'bcrypt';

export const isPasswordValid = (password: string): boolean => {
  const minLength = 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  return password.length >= minLength && hasLetter && hasDigit;
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
