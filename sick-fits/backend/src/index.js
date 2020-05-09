// Dependencies
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Environment Variables
require('dotenv').config({ path: 'variables.env' });

// GraphQL
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// Middleware
server.express.use(cookieParser());
server.express.use((req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }

  next();
});

server.start(
  { cors: { credentials: true, origin: process.env.FRONTEND_URL } },
  (details) => {
    console.log(`GraphQL running on http://localhost:${details.port}`);
  }
);
