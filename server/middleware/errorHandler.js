/**
 * Global Error Handling Middleware
 * Catch all unhandled exceptions thrown in asynchronous controllers
 * and return standard, user-friendly JSON responses with correct HTTP status codes.
 */
const errorHandler = (err, req, res, next) => {
  // Log the full traceback to the console for server debugging
  console.error('[Error Traceback]:');
  console.error(err);

  // Set default values for status code and message
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected server error occurred';

  // Return standard response format
  res.status(statusCode).json({
    success: false,
    error: {
      status: statusCode,
      message: message,
      // Only show stack trace in non-production environments
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }
  });
};

export default errorHandler;
