import server from "./app/graphql/server";

server.listen().then(async ({ url }) => {
  console.log(url);
});
