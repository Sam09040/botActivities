import { JwtService } from '@core/security/jwt';
import Container from 'typedi';

export interface ServerContext {
  userId: number;
  token: string | undefined;
}

export const context = async ({ req }: any): Promise<ServerContext> => {
  const token = req.headers.authorization ?? undefined;
  const { userId } = Container.get(JwtService).decode<ServerContext>(token).data;
  return { userId, token };
};
