import { ApolloServer, gql } from "apollo-server";
import { User } from './interfaces';
import { readFileSync } from "fs";
const typeDefs = gql(readFileSync("./src/schema.graphql", "utf8"))

const users: User[] = [];

const resolvers = {
    Query: {
        test: () => "it's working!",
        users: () => users.map(({ password, ...user }) => user),
    },
    Mutation: {
        createUser: (_, { data }: { data: Omit<User, 'id'> }) => {
            if(!data){
                throw new Error("Data is missing!");
            }
            const newUser = {
                id: Math.floor(Math.random() * 100),
                ...data,
            };
            users.push(newUser);
            return {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                birthDate: newUser.birthDate,
            };
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then( async ({ url }) => {
    console.log(url);
});
