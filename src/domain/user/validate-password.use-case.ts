const PASSWORD_MIN_LENGTH: number = Number(process.env.PASSWORD_MIN_LENGTH);

function hasDigit(value?: string): boolean {
  return value?.search(/\d/) !== -1;
}

function hasLetter(value?: string): boolean {
  return value?.search(/[a-zA-Z]/) !== -1;
}

function hasValidLength(value?: string): boolean {
  const length = value?.length ?? 0;
  return length >= PASSWORD_MIN_LENGTH;
}

function validate(value?: string): string | null {
  if (!hasValidLength(value)) {
    return 'password must be at least ' + PASSWORD_MIN_LENGTH;
  }

  if (!hasDigit(value)) {
    return 'password must have a number';
  }

  if (!hasLetter(value)) {
    return 'password must have a letter';
  }

  return null;
}

export const ValidatePasswordUseCase = {
  exec: validate,
};
