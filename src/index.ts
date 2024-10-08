import { ApolloServer, gql } from "apollo-server";
import { UserInput } from './interfaces';
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const typeDefs = gql(readFileSync("./src/schema.graphql", "utf8"));

const prisma = new PrismaClient();

const resolvers = {
    Query: {
        test: () => "it's working!",
        users: async () => {
            const users = await prisma.user.findMany();
            
            if(!users){
                return null;
            }

            return users;
        },
        user: async (_: unknown, { id }: { id: number }) => {
            const user = prisma.user.findUnique({
                where: { id: id },
            });

            if(!user){
                throw new Error("User not found!");
            }
            
            return user;
        },
    },
    Mutation: {
        createUser: async (_: unknown, { data }: UserInput) => {
            if(!data){
                throw new Error("Data is missing!");
            }

            const { name, email, password, birthDate } = data;

            const existingEmail = await prisma.user.findFirst({
                where: { email: email },
            });

            if(existingEmail){
                throw new Error("Email already exists!");
            }

            const saltRounds = 10;
            const hashPassword = await bcrypt.hash(password, saltRounds);
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashPassword,
                    birthDate,
                },
            });
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
