import { validationResult } from 'express-validator';

/**
 * Validate request and return errors if any
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
}

/**
 * Custom error response
 */
export function errorResponse(res, statusCode, message, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

/**
 * Success response
 */
export function successResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
}
