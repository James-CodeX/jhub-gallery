/**
 * AsyncHandler middleware to wrap async route handlers
 * Catches errors and passes them to Express error handler
 * 
 * Usage:
 * router.get('/path', asyncHandler(async (req, res) => {
 *   // Your async code here
 * }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create common API errors
 */
export const NotFoundError = (message = 'Resource not found') => 
  new ApiError(404, message);

export const BadRequestError = (message = 'Bad request') => 
  new ApiError(400, message);

export const UnauthorizedError = (message = 'Unauthorized') => 
  new ApiError(401, message);

export const ForbiddenError = (message = 'Forbidden') => 
  new ApiError(403, message);

export const ConflictError = (message = 'Conflict') => 
  new ApiError(409, message);

export const ValidationError = (message = 'Validation failed') => 
  new ApiError(422, message);
