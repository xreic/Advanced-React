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
// Parse Cookies
server.express.use(cookieParser());

/**
 * If the cookies have a token
 * Extract the userId by verifying the token
 * Add the userId to the request
 * Pass along
 */
server.express.use((req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }

  next();
});

/**
 * Check if a user is logged in
 */
server.express.use(async (req, res, next) => {
  if (!req.userId) return next();

  const user = await db.query.user(
    { where: { id: req.userId } },
    '{id, permissions, email, name}'
  );

  req.user = user;

  next();
});

server.start(
  { cors: { credentials: true, origin: process.env.FRONTEND_URL } },
  (details) => {
    console.log(`GraphQL running on http://localhost:${details.port}`);
  }
);
