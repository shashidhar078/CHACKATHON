import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string()
});

// Thread validation schemas
export const createThreadSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).max(5000).trim(),
  topic: z.string().min(1).max(50).trim(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageCaption: z.string().max(200).trim().optional().or(z.literal(''))
});

export const threadQuerySchema = z.object({
  topic: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  sort: z.enum(['newest', 'oldest', 'popular']).optional()
});

// Reply validation schemas
export const createReplySchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  parentReplyId: z.string().optional()
});

export const replyQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  sort: z.enum(['newest', 'oldest']).optional()
});

// Like validation schemas
export const likeActionSchema = z.object({
  action: z.enum(['toggle'])
});

// Admin validation schemas
export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin'])
});

export const notificationQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional()
});

// Generic validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      next(error);
    }
  };
};

// Query validation middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      next(error);
    }
  };
};
