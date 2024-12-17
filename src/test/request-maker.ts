import { ServerError } from '@graphql/graphql-error.formatter';
import axios from 'axios';

export interface GraphqlResponse<T> {
  data: GraphqlResponseBody<T>;
}

interface GraphqlResponseBody<T> {
  data?: T;
  errors?: ServerError[];
}

interface GraphqlBody<TVariables> {
  query: string;
  variables?: TVariables;
}

export interface HeaderParams {
  token?: string;
}

export async function requestMaker<TData, TVariables>(
  { query, variables }: GraphqlBody<TVariables>,
  Auth?: HeaderParams,
): Promise<GraphqlResponse<TData>> {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
  let headers = {
    Authorization: '',
  };
  Auth ? (headers['Authorization'] = Auth.token) : (headers['Authorization'] = 'none');
  return (await axios.post(url, { query, variables }, { headers })) as GraphqlResponse<TData>;
}
