/**
 * Zod validation schemas for all user inputs and API requests.
 * These schemas ensure data integrity and prevent XSS/injection attacks.
 */

import { z } from 'zod';

// Common reusable schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens');

// User validation
export const userRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['super_admin', 'admin', 'student']),
  organizationId: uuidSchema.optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  mfaToken: z.string().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  preferences: z
    .object({
      language: z.enum(['en', 'sw']),
      emailNotifications: z.boolean(),
      smsNotifications: z.boolean(),
    })
    .optional(),
});

// Course validation
export const courseCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Executive']),
  language: z.string().min(1, 'Language is required'),
  estimatedHours: z.number().min(1, 'Estimated hours must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
  isFree: z.boolean(),
  tags: z.array(z.string()).max(20),
  learningObjectives: z.array(z.string()).min(1, 'At least one learning objective required'),
  prerequisites: z.array(z.string()),
  instructorId: uuidSchema,
});

export const courseUpdateSchema = courseCreateSchema.partial();

// Module validation
export const moduleCreateSchema = z.object({
  title: z.string().min(1, 'Module title is required').max(200),
  description: z.string().max(1000).optional(),
  order: z.number().int().positive(),
});

// Lesson validation
export const lessonCreateSchema = z.object({
  title: z.string().min(1, 'Lesson title is required').max(200),
  durationMinutes: z.number().int().positive(),
  type: z.enum(['video', 'text', 'document', 'practical', 'quiz', 'assignment']),
  order: z.number().int().positive(),
  isOptional: z.boolean().optional(),
});

// Quiz validation
export const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(200),
  description: z.string().max(1000).optional(),
  timeLimitMinutes: z.number().int().positive(),
  passThresholdPercent: z.number().min(0).max(100),
  maxAttempts: z.number().int().positive().max(10),
  questions: z
    .array(
      z.object({
        prompt: z.string().min(1, 'Question prompt is required'),
        options: z.array(z.string()).min(2, 'At least 2 options required').max(10),
        correctOptionIndex: z.number().int().min(0),
        explanation: z.string().max(2000).optional(),
        points: z.number().int().positive(),
      })
    )
    .min(1, 'At least one question required'),
});

// Assignment validation
export const assignmentSchema = z.object({
  title: z.string().min(1, 'Assignment title is required').max(200),
  instructions: z.string().min(1, 'Instructions are required'),
  rubric: z
    .array(
      z.object({
        criterion: z.string().min(1, 'Criterion is required'),
        maxScore: z.number().int().positive(),
      })
    )
    .min(1, 'At least one rubric criterion required'),
  maxScore: z.number().int().positive(),
  dueDate: z.string().datetime().optional(),
});

// Enrollment validation
export const enrollmentSchema = z.object({
  courseId: uuidSchema,
  learnerId: uuidSchema,
});

// Certificate validation
export const certificateIssueSchema = z.object({
  learnerId: uuidSchema,
  learnerName: z.string().min(1, 'Learner name is required'),
  courseId: uuidSchema,
  courseTitle: z.string().min(1, 'Course title is required'),
  courseVersion: z.string().min(1, 'Course version is required'),
  issuerName: z.string().min(1, 'Issuer name is required'),
  issuerTitle: z.string().min(1, 'Issuer title is required'),
});

// Support ticket validation
export const supportTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  category: z.enum(['account', 'payment', 'academic', 'technical']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  initialMessage: z.string().min(1, 'Message is required').max(5000),
});

// Audit log validation
export const auditLogSchema = z.object({
  actorId: uuidSchema,
  actorName: z.string().min(1),
  actorRole: z.enum(['super_admin', 'admin', 'student']),
  action: z.string().min(1).max(100),
  entityType: z.enum([
    'course',
    'user',
    'role',
    'certificate',
    'grade',
    'system',
    'organization',
  ]),
  entityId: z.string().min(1),
  details: z.string().min(1).max(2000),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
});

// Sanitization helper - remove potentially dangerous HTML
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}
