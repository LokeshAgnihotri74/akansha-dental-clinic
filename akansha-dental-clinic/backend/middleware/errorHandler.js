const { error } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('🚨 [Server Error]:', err.stack || err.message);

  if (err.name === 'ValidationError') {
    return error(res, err.message, 400);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'A record with these details already exists in the clinic database.', 409);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  return error(res, message, statusCode);
};

const notFound = (req, res) => {
  return error(res, `Route endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = {
  errorHandler,
  notFound
};
