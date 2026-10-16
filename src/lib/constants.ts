/**
 * Application-wide constants.
 * Centralizes magic strings, role definitions, permission keys, and route keys
 * to prevent typos and enable easy refactoring.
 */

export const APP_NAME = 'Csbox Cloud Academy';
export const APP_VERSION = '2.4.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Role types
export const ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  STUDENT: 'student' as const,
} as const;

export type RoleKey = (typeof ROLES)[keyof typeof ROLES];

// Permission keys
export const PERMISSIONS = {
  COURSE_CREATE: 'course.create',
  COURSE_UPDATE_OWN: 'course.update.own',
  COURSE_UPDATE_ANY: 'course.update.any',
  COURSE_REVIEW_ASSIGNED: 'course.review.assigned',
  COURSE_PUBLISH: 'course.publish',
  COURSE_UNPUBLISH: 'course.unpublish',
  USER_MANAGE: 'user.manage',
  USER_SUSPEND: 'user.suspend',
  ROLE_ASSIGN: 'role.assign',
  CERTIFICATE_ISSUE: 'certificate.issue',
  CERTIFICATE_REVOKE: 'certificate.revoke',
  AUDIT_READ: 'audit.read',
  GRADING_MANAGE: 'grading.manage',
  ORG_MANAGE: 'org.manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Navigation keys
export const NAV_KEYS = {
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  COURSES: 'courses',
  CATALOG: 'catalog',
  ASSESSMENTS: 'assessments',
  CERTIFICATES: 'certificates',
  GRADING: 'grading',
  USERS: 'users',
  AUDIT: 'audit',
  HEALTH: 'health',
  INTEGRATIONS: 'integrations',
  SUPPORT: 'support',
  MY_PLAN: 'my_plan',
} as const;

export type NavKey = (typeof NAV_KEYS)[keyof typeof NAV_KEYS];

// Role-based navigation mappings
export const ROLE_NAV_MAP: Record<RoleKey, NavKey[]> = {
  [ROLES.STUDENT]: [
    NAV_KEYS.DASHBOARD,
    NAV_KEYS.TASKS,
    NAV_KEYS.COURSES,
    NAV_KEYS.CATALOG,
    NAV_KEYS.ASSESSMENTS,
    NAV_KEYS.CERTIFICATES,
    NAV_KEYS.SUPPORT,
  ],
  [ROLES.ADMIN]: [
    NAV_KEYS.DASHBOARD,
    NAV_KEYS.TASKS,
    NAV_KEYS.COURSES,
    NAV_KEYS.GRADING,
    NAV_KEYS.CATALOG,
    NAV_KEYS.CERTIFICATES,
    NAV_KEYS.INTEGRATIONS,
    NAV_KEYS.SUPPORT,
  ],
  [ROLES.SUPER_ADMIN]: [
    NAV_KEYS.DASHBOARD,
    NAV_KEYS.TASKS,
    NAV_KEYS.COURSES,
    NAV_KEYS.GRADING,
    NAV_KEYS.CATALOG,
    NAV_KEYS.CERTIFICATES,
    NAV_KEYS.USERS,
    NAV_KEYS.AUDIT,
    NAV_KEYS.INTEGRATIONS,
    NAV_KEYS.HEALTH,
    NAV_KEYS.MY_PLAN,
    NAV_KEYS.SUPPORT,
  ],
} as const;

// Audit log severity levels
export const AUDIT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

// Audit log entity types
export const AUDIT_ENTITY_TYPE = {
  COURSE: 'course',
  USER: 'user',
  ROLE: 'role',
  CERTIFICATE: 'certificate',
  GRADE: 'grade',
  SYSTEM: 'system',
  ORGANIZATION: 'organization',
} as const;

// Course status values
export const COURSE_STATUS = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  REVISION_REQUESTED: 'revision_requested',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// Lesson types
export const LESSON_TYPE = {
  VIDEO: 'video',
  TEXT: 'text',
  DOCUMENT: 'document',
  PRACTICAL: 'practical',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
} as const;

// Certificate status
export const CERTIFICATE_STATUS = {
  VALID: 'valid',
  REVOKED: 'revoked',
} as const;

// Support ticket categories
export const SUPPORT_CATEGORY = {
  ACCOUNT: 'account',
  PAYMENT: 'payment',
  ACADEMIC: 'academic',
  TECHNICAL: 'technical',
} as const;

// Support ticket priorities
export const SUPPORT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Support ticket statuses
export const SUPPORT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'csbox_auth_token',
  REFRESH_TOKEN: 'csbox_refresh_token',
  USER_PREFERENCES: 'csbox_user_preferences',
  THEME: 'csbox_theme',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
  ],
} as const;
