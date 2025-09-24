import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Default error
  let status = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  } else if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Duplicate entry found';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'Referenced record not found';
  } else if (error.message) {
    message = error.message;
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  res.status(status).json(response);
};
