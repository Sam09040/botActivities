import { JwtService } from "@core/security/jwt";

export interface ServerContext {
  userId: number;
  token: string | undefined;
}

export const context = async ({ req }: any): Promise<ServerContext> => {
  const token = req.headers.authorization ?? undefined;
  const { userId } = new JwtService().decode<ServerContext>(token).data;
  return { userId, token };
};
