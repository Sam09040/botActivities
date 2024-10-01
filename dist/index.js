import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
const typeDefs = `#graphql
#Comments start wish '#' symbol
#This "Book" type defines the queryable fields every book in the query
type Book{
    title: String
    author: String
}

#The "Query" type is special: it lists all the available queries that clients can execute, along with the return type for each one. In this case, "books" will return an array of zero or many books.
type Query {
    books: [Book]
}
`;
const books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Aster',
    },
];
// Resolvers define how to fetch the types defined in the schema. This one will retrieve books from the "books" array 
const resolvers = {
    Query: {
        books: () => books,
    },
};
// The ApolloServer constructor requires two parameters: the schema definition and the set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// Passing an ApolloServer instance to the startStandaloneServer function:
// 1. creates an Express app
// 2. installs your ApolloServer instance as middleware
// 3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`:rocket: Server ready at: ${url}`);
