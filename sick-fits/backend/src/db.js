/**
 * This file connects to the remote Prisma DB
 * and lets us query it with JS using the
 * prisma-bindings for JS
 */

const { Prisma } = require('prisma-binding');

/**
 * Have to use __dirname + path
 * instead of relative path
 */

const db = new Prisma({
  typeDefs: __dirname + '/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: false
});

module.exports = db;
