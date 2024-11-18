export const isPasswordValid = (password: string): boolean => {
    const minLength = 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);

    return password.length >= minLength && hasLetter && hasDigit;
};

export default isPasswordValid;