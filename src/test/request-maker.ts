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

export function requestMaker<TData, TVariables>({
  query,
  token,
  formData,
  variables,
}: Options<TVariables>): Promise<GraphqlResponse<TData>> {
  const port = process.env.PORT;
  const url = `http://localhost:${port}/`;
  let headers = {};
  if (token) {
    headers = {
      Authorization: token,
    };
  }
  if (formData) {
    headers = {
      ...headers,
      'Apollo-Require-Preflight': true,
      'Content-Type': 'multipart/form-data',
    };
    return axios.post(url, formData, { headers });
  }
  return axios.post(
    url,
    { query, variables },
    {
      headers,
    },
  );
}
