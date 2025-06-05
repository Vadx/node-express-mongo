import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/AppError';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 20 characters',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
    }),
  firstName: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Last name cannot exceed 50 characters',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

export const taskSchema = Joi.object({
  title: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': 'Title cannot exceed 200 characters',
    }),
  description: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed', 'cancelled')
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed, cancelled',
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent',
    }),
  dueDate: Joi.date()
    .min('now')
    .messages({
      'date.min': 'Due date must be in the future',
    }),
  tags: Joi.array()
    .items(Joi.string().max(30))
    .messages({
      'string.max': 'Each tag cannot exceed 30 characters',
    }),
  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid user ID format',
    }),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string()
    .max(200)
    .messages({
      'string.max': 'Title cannot exceed 200 characters',
    }),
  description: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed', 'cancelled')
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed, cancelled',
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent',
    }),
  dueDate: Joi.date()
    .min('now')
    .allow(null)
    .messages({
      'date.min': 'Due date must be in the future',
    }),
  tags: Joi.array()
    .items(Joi.string().max(30))
    .messages({
      'string.max': 'Each tag cannot exceed 30 characters',
    }),
});