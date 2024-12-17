export interface Paginated<Model> {
  nodes: Model[];
  count: number;
  pageInfo: Partial<PageInfoModel>;
}

export interface PageInputModel {
  skip?: number;
  limit: number;
}

export interface PageInfoModel {
  skip: number;
  limit: number;
  page: number;
  maxPage: number;
}

export const DEFAULT_PAGE_SIZE: number = 10;

export function buildPageInfo(input: PageInputModel, totalItems: number): PageInfoModel {
  const skip = input.skip ?? 0;
  const limit = input.limit !== 0 ? input.limit : DEFAULT_PAGE_SIZE;
  return {
    skip,
    limit,
    page: skip ? Math.ceil(skip / limit) : 1,
    maxPage: Math.ceil(totalItems / limit),
  };
}
