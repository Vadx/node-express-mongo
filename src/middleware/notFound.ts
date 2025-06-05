import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};