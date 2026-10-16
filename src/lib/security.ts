/**
 * Security utilities for data sanitization and XSS prevention.
 *
 * Provides functions to:
 * - Strip sensitive fields from quiz data before sending to learners
 * - Sanitize user-generated content to prevent XSS attacks
 * - Validate and sanitize HTML input
 */

import { Quiz, QuizQuestion, Course } from '../types';

/**
 * A quiz question without the correct answer index, safe for learner consumption.
 */
export interface LearnerQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  explanation: string;
  points: number;
}

/**
 * A quiz without correct answer indices, safe for learner consumption.
 */
export interface LearnerQuiz {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passThresholdPercent: number;
  maxAttempts: number;
  questions: LearnerQuizQuestion[];
}

/**
 * Removes correctOptionIndex from quiz questions so learners cannot see answers.
 * Should be applied to quiz data before it reaches the client-side quiz player.
 */
export function sanitizeQuizForLearner(quiz: Quiz): LearnerQuiz {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    timeLimitMinutes: quiz.timeLimitMinutes,
    passThresholdPercent: quiz.passThresholdPercent,
    maxAttempts: quiz.maxAttempts,
    questions: quiz.questions.map(({ correctOptionIndex, ...rest }) => rest),
  };
}

/**
 * Strips correctOptionIndex from all quizzes in a course's lessons.
 * Returns a new course object with sanitized quiz data safe for learners.
 */
export function sanitizeCourseForLearner(course: Course): Course {
  const sanitizedCourse = { ...course };
  sanitizedCourse.versions = course.versions.map(version => ({
    ...version,
    modules: version.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => {
        if (lesson.content?.quiz) {
          return {
            ...lesson,
            content: {
              ...lesson.content,
              quiz: sanitizeQuizForLearner(lesson.content.quiz) as unknown as Quiz,
            },
          };
        }
        return lesson;
      }),
    })),
  }));
  return sanitizedCourse;
}

/**
 * Sanitizes a string for safe rendering in the browser.
 * Removes script tags, event handlers, and javascript: URLs to prevent XSS.
 * This is a lightweight client-side sanitizer; server-side sanitization
 * (e.g., DOMPurify) is recommended for production.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)/gi, '')
    // Remove javascript: URLs
    .replace(/javascript\s*:/gi, '')
    // Remove vbscript: URLs
    .replace(/vbscript\s*:/gi, '')
    // Remove data: URLs with script content
    .replace(/data\s*:\s*text\/html/gi, '');
}

/**
 * Sanitizes user-provided text content for safe display.
 * Escapes HTML entities to prevent XSS.
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that a string does not contain potentially dangerous content.
 * Returns true if the input appears safe.
 */
export function isSafeInput(input: string): boolean {
  const dangerousPatterns = [
    /<script\b/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /<link\b/gi,
    /<meta\b/gi,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
}
