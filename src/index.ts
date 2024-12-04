import { server } from './api/graphql/server';

server.listen(process.env.PORT).then(async ({ url }) => {
  console.log(url);
});
