import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/AppError';

interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    if (!process.env.JWT_SECRET) {
      return next(new AppError('JWT secret not configured', 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.isActive) {
      return next(new AppError('User account is deactivated', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // For this simple example, we'll assume all authenticated users have 'user' role
    // In a real application, you'd have a role field in the user model
    const userRole = 'user';
    
    if (!roles.includes(userRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export { AuthRequest };