/**
 * Standard API Response Envelope Helpers
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  const payload = {
    success: true,
    message,
    data
  };

  // If data is an object, also spread top-level keys for maximum frontend convenience
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    Object.assign(payload, data);
  }

  return res.status(statusCode).json(payload);
};

const error = (res, message = 'An unexpected error occurred', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details })
  });
};

module.exports = {
  success,
  error
};
