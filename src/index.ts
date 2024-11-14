import server from "./graphql/server";

server.listen().then(async ({ url }) => {
  console.log(url);
});
