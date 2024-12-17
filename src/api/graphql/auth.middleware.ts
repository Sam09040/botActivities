import { AuthChecker } from 'type-graphql';
import { ServerContext } from './server.context';
import { UnauthorizedError } from '@core/error';
import { JwtService } from '@core/security/jwt';
import Container from 'typedi';

export const AuthorizationMiddleware: AuthChecker<ServerContext> = async ({ context }) => {
  const jwtService = Container.get(JwtService);
  const { token } = context;
  if (!token) {
    throw new UnauthorizedError('Token is required for this operation!', {
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  const decode = jwtService.verify<ServerContext>(token);
  context.userId = decode.data.userId;
  return true;
};
