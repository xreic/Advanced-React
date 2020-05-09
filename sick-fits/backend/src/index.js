// Environment Variables
require('dotenv').config({ path: 'variables.env' });

// GraphQL
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO Use express middleware to handle cookies (JSON Web Tokens - JWT)
// TODO Use express middleware to populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  (details) => {
    console.log(`GraphQL running on http://localhost:${details.port}`);
  }
);
