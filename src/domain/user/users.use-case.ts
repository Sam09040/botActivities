import { UnauthorizedError } from '@core/error';
import { buildPageInfo, PageInfoModel, PageInputModel } from '@core/pagination';
import { JwtService } from '@core/security/jwt';
import { UserDbDataSource } from '@data/user';

const datasource = new UserDbDataSource();
const jwtService = new JwtService();

export async function usersUseCase({ input }: PageInputModel, token: string | undefined) {
  let { skip, limit } = input;
  if (!token) {
    throw new UnauthorizedError('Token is required for this operation!', {
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  jwtService.verify(token);

  const totalUsers = await datasource.count();
  const pageInfo = buildPageInfo({ input }, totalUsers);
  skip = pageInfo.skip;
  limit = pageInfo.limit;
  const { page, maxPage } = pageInfo;
  return {
    users: await datasource.findAll(skip, limit),
    page,
    maxPage,
  };
}
