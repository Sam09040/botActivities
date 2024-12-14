export interface ServerContext {
  token: string | undefined;
}

export const context = async ({ req }: any): Promise<ServerContext> => {
  const token = req.headers.authorization ?? undefined;
  return { token };
};
