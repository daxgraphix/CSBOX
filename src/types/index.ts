export type RoleType = 
  | 'super_admin'
  | 'admin'
  | 'instructor'
  | 'reviewer'
  | 'student'
  | 'organization'
  | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: RoleType;
  organizationId?: string;
  organizationName?: string;
  isSuspended: boolean;
  suspensionReason?: string;
  lastLogin: string;
  mfaEnabled: boolean;
  preferences: {
    language: 'en' | 'sw';
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

export type Permission = 
  | 'course.create'
  | 'course.update.own'
  | 'course.update.any'
  | 'course.review.assigned'
  | 'course.publish'
  | 'course.unpublish'
  | 'user.manage'
  | 'user.suspend'
  | 'role.assign'
  | 'certificate.issue'
  | 'certificate.revoke'
  | 'audit.read'
  | 'grading.manage'
  | 'org.manage'
  | 'course.review'
  | 'review.submit'
  | 'support.ticket.create'
  | 'support.ticket.manage'
  | 'organization.manage'
  | 'organization.member.manage';

export type CourseStatus = 'draft' | 'under_review' | 'revision_requested' | 'approved' | 'published' | 'archived';

export type LessonType = 'video' | 'text' | 'document' | 'practical' | 'quiz' | 'assignment';

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'zip';
  url: string;
  size?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number; // Hidden from learner until submission
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passThresholdPercent: number;
  maxAttempts: number;
  questions: QuizQuestion[];
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  rubric: { criterion: string; maxScore: number }[];
  maxScore: number;
  dueDate?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  type: LessonType;
  order: number;
  isOptional?: boolean;
  content: {
    videoUrl?: string;
    videoDuration?: string;
    textBody?: string;
    documentUrl?: string;
    documentName?: string;
    practicalTasks?: { id: string; description: string; completed: boolean }[];
    quiz?: Quiz;
    assignment?: Assignment;
  };
  resources?: LessonResource[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseVersion {
  version: string; // e.g. "1.0", "1.1"
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  modules: Module[];
  changelog?: string;
  reviewFeedback?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  category: 'curriculum' | 'accessibility' | 'assessment' | 'general';
  comment: string;
  resolved: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive';
  language: string;
  estimatedHours: number;
  price: number;
  isFree: boolean;
  tags: string[];
  learningObjectives: string[];
  prerequisites: string[];
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorBio: string;
  activeVersion: string;
  versions: CourseVersion[];
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
}

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
  completedAt?: string;
  certificateId?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  learnerId: string;
  learnerName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  courseId: string;
  lessonId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  submittedAt: string;
  fileUrl: string;
  fileName: string;
  notes: string;
  status: 'pending' | 'graded';
  gradedBy?: string;
  gradedAt?: string;
  score?: number;
  maxScore: number;
  rubricScores?: Record<string, number>;
  feedback?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // e.g. "LS-2026-CERT-90412"
  learnerId: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  courseVersion: string;
  issuedAt: string;
  verificationHash: string;
  issuerName: string;
  issuerTitle: string;
  status: 'valid' | 'revoked';
  revocationReason?: string;
  revokedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: RoleType;
  action: string;
  entityType: 'course' | 'user' | 'role' | 'certificate' | 'grade' | 'system' | 'organization';
  entityId: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo: string;
  seatLimit: number;
  activeSeats: number;
  cohorts: Cohort[];
  assignedCourseIds: string[];
}

export interface Cohort {
  id: string;
  name: string;
  organizationId: string;
  courseIds: string[];
  startDate: string;
  endDate: string;
  memberEmails: string[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'account' | 'payment' | 'academic' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved';
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: string;
  }[];
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconName: string;
  estimatedWeeks: number;
  careerRole: string;
  courseIds: string[];
}
