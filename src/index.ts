import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { title } from "process";

const typeDefs = `#graphql
#Comments start wish '#' symbol
#This "Book" type defines the queryable fields every book in the query
type Book{
    title: string
    author: string
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