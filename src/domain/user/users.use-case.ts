import { buildPageInfo, PageInputModel } from '@core/pagination';
import { UserDbDataSource } from '@data/user';

const datasource = new UserDbDataSource();

export async function usersUseCase(input: PageInputModel) {
  let { skip, limit } = input;

  const totalUsers = await datasource.count();
  const pageInfo = buildPageInfo(input, totalUsers);
  skip = pageInfo.skip;
  limit = pageInfo.limit;
  const { page, maxPage } = pageInfo;
  return {
    users: await datasource.findAll(skip, limit),
    page,
    maxPage,
  };
}
