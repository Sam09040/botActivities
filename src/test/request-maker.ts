import { ServerError } from '@graphql/graphql-error.formatter';
import axios from 'axios';
import FormData from 'form-data';

interface Options<TVariables> {
  query?: string;
  token?: string;
  formData?: FormData;
  variables?: TVariables;
}

export interface GraphqlResponse<T> {
  data: GraphqlResponseBody<T>;
}

interface GraphqlResponseBody<T> {
  data?: T;
  errors?: ServerError[];
}

export async function requestMaker<TData, TVariables>({
  query,
  token,
  formData,
  variables,
}: Options<TVariables>): Promise<GraphqlResponse<TData>> {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
  let headers = {
    Authorization: '',
    'Apollo-Require-Preflight': true,
    'Content-Type': 'multipart/form-data',
  };
  token ? (headers.Authorization = token) : (headers.Authorization = '');

  return (await axios.post(url, formData ? formData : { query, variables }, {
    headers,
  })) as GraphqlResponse<TData>;
}
