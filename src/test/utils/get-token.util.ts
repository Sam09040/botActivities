import axios from 'axios';
import { JwtService } from '@core/security/jwt';
import { JWT_EXPIRATION_TIME, JWT_SECRET } from '@core/security/jwt/jwt.config';
import { requestMaker } from '@test/request-maker';
import { LoginInputModel } from '@domain/model';

export const getToken = async (): Promise<string | undefined> => {
  const jwtService = new JwtService(JWT_EXPIRATION_TIME, JWT_SECRET);
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
  const response = await requestMaker<any, LoginInputModel>({ query: mutation, variables });
  const login = response.data.data.login.token;
  return jwtService.verify(login) ? login : undefined;
};
