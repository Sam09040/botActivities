import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { title } from "process";

const typeDefs = `#graphql
#Comments start wish '#' symbol
#This "Book" type defines the queryable fields every book in the query
type Book{
    title: String
    author: String
}

type Person{
    name: String
    age: Int
}

#The "Query" type is special: it lists all the available queries that clients can execute, along with the return type for each one. In this case, "books" will return an array of zero or many books.
type Query {
    books: [Book]
    people: [Person]
    hello: String
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
    {
        title: 'Almost Perfect',
        author: 'Kaique Brito',
    },
];

const hello = "Hello, world!";
/* const name = "Sam";
const age = 20; */

const people = [
    {
        name: 'Sam',
        age: 20,
    },
    {
        name: 'Anna',
        age: 21,
    },
];

// Resolvers define how to fetch the types defined in the schema. This one will retrieve books from the "books" array 
const resolvers = {
    Query: {
        books: () => books, 
        people: () => people,
        hello: () => hello
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

console.log(`🚀 Server ready at: ${url}`);
