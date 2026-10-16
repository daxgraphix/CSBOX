/**
 * API Service Layer - Connects frontend to the Express backend.
 *
 * Replaces direct mock data usage with real HTTP API calls.
 * All requests include JWT authentication when available.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { env } from '../lib/env';

const API_BASE = env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get the auth token from localStorage or Supabase session.
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('csbox_access_token');
  }
  return null;
}

/**
 * Set the auth token in localStorage.
 */
function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('csbox_access_token', token);
  }
}

/**
 * Remove the auth token from localStorage.
 */
function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('csbox_access_token');
  }
}

/**
 * Build headers for API requests.
 */
function getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Generic API request handler with error handling.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'super_admin' | 'admin' | 'student';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.accessToken) {
    setAuthToken(response.accessToken);
  }

  return response;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.accessToken) {
    setAuthToken(response.accessToken);
  }

  return response;
}

export async function logout(): Promise<void> {
  removeAuthToken();
  // Optionally call server logout endpoint
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout errors
  }
}

export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
} | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await apiRequest<{ user: { id: string; email: string; name: string; role: string } }>(
      '/auth/me'
    );
    return response.user;
  } catch {
    removeAuthToken();
    return null;
  }
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  language: string;
  estimatedHours: number;
  price: number;
  isFree: boolean;
  tags: string[];
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  activeVersion: string;
}

export async function getCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/courses');
}

export async function getCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/courses/${id}`);
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  return apiRequest<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  return apiRequest<Course>(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function publishCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/courses/${id}/publish`, {
    method: 'POST',
  });
}

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------

export interface Enrollment {
  id: string;
  learnerId: string;
  courseId: string;
  courseVersion: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completedLessonIds: string[];
  progressPercent: number;
  isCompleted: boolean;
}

export async function getEnrollments(): Promise<Enrollment[]> {
  return apiRequest<Enrollment[]>('/enrollments');
}

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  return apiRequest<Enrollment>('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

export interface Certificate {
  id: string;
  certificateNumber: string;
  learnerId: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  courseVersion: string;
  issuedAt: string;
  verificationHash: string;
  issuerName: string;
  issuerTitle: string;
  status: string;
}

export async function getCertificates(): Promise<Certificate[]> {
  return apiRequest<Certificate[]>('/certificates');
}

export async function issueCertificate(data: {
  learnerId: string;
  learnerName: string;
  courseId: string;
}): Promise<Certificate> {
  return apiRequest<Certificate>('/certificates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyCertificate(hash: string): Promise<Certificate | null> {
  try {
    return await apiRequest<Certificate>(`/certificates/verify/${hash}`);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Quiz Attempts
// ---------------------------------------------------------------------------

export interface QuizAttempt {
  id: string;
  quizId: string;
  learnerId: string;
  courseId: string;
  answers: Record<string, number>;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

export async function submitQuizAttempt(data: {
  quizId: string;
  courseId: string;
  answers: Record<string, number>;
}): Promise<{ passed: boolean; score: number; percentage: number }> {
  return apiRequest('/quiz/attempts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: string;
  }>;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  return apiRequest<SupportTicket[]>('/support/tickets');
}

export async function createSupportTicket(data: {
  subject: string;
  category: string;
  priority: string;
  initialMessage: string;
}): Promise<SupportTicket> {
  return apiRequest<SupportTicket>('/support/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  severity: string;
  createdAt: string;
  ipAddress: string;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>('/audit/logs');
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return apiRequest('/health');
}
