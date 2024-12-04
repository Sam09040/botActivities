import axios from 'axios';
import { verifyToken } from '../../src/core/security/validation/validation';

export const getToken = async (url: string): Promise<string | undefined> => {
  const variables = {
    data: {
      email: 'sam@example.com',
      password: 'Sam123',
      rememberMe: false,
    },
  };

  const mutation = `
    mutation login ($data: LoginInput!) {
        login (data: $data) {
            user {
                id,
                name,
                email,
                birthDate
            },
            token
        }
    }
  `;

  const response = await axios.post(url, { query: mutation, variables });
  const login = response.data.data.login;
  return verifyToken(login.token) ? login.token : undefined;
};
