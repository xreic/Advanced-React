const { GraphQLServer } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db');

// Create GraphQL Yoga Server

/**
 * Have to use __dirname + path
 * instead of relative path
 */

const createServer = () =>
  new GraphQLServer({
    typeDefs: __dirname + '/schema.graphql',
    resolvers: { Mutation, Query },
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    context: (req) => ({ ...req, db })
  });

module.exports = createServer;
