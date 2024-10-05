var express = require('express');
var { createHandler } = require("graphql-http/lib/use/express");
var { buildSchema, graphql } = require("graphql");
var { ruruHTML } = require("ruru/server");

// Building a schema, using GraphQL schema language 
var schema = buildSchema(`
    type Query {
      hello: String
      name: String
    }
`);

// The rootValue uses a resolver function for each endpoint of the API
var rootValue = {
    hello() {
        return "Hello world!"
    },
    name() {
        return "Sam"
    }
};
   
var app = express();

// Runs the GraphQL query and prints the response
graphql({
    schema,
    source: "{hello, name}",	
    rootValue
}).then(response => {
    console.log(response)
});

app.get("/", (_req, res) => {
    res.type("html")
    res.end(ruruHTML({ endpoint: "/graphql" }))
});

// Create and uses the Handler
app.all(
    "/graphql",
    createHandler({
        schema,
        rootValue
    })
);

// Starts the server at port 4000
app.listen({ port: 4000 });
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
