const { getConfig } = require('./config');
const createError = require('http-errors');

const authenticate = headers => {
  const { authorization } = headers;
  if (!authorization) {
    throw createError(401, "Unauthorized: Missing 'authorization' header");
  }
  const [, token] = authorization.split('Bearer ');
  if (!token) {
    throw createError(400, 'Bad Request: Bad authorization header value (no bearer)');
  }
  const [user, secret] = token.split('.');
  if (!user || !secret) {
    throw createError(400, 'Bad Request: Bad authorization header value (invalid bearer token)');
  }

  if (secret !== getConfig().AUTH_SECRET) {
    throw createError(403, 'Forbidden: Not allowed');
  }

  return user;
};
module.exports = { authenticate };
