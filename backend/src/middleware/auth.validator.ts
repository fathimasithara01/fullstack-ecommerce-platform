import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
    email: z.string().email('Provide a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one numerical digit')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Provide a valid email address'),
    password: z.string().min(1, 'Password field cannot be transmitted empty'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Provide a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token param cannot be transmitted empty'),
  }),
  body: z.object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must contain at least 2 characters').optional(),
    avatar: z.string().url('Avatar must reference a valid network URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password input required'),
    newPassword: z
      .string()
      .min(8, 'New password must contain at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
  }),
});