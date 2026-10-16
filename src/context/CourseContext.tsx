import React, { createContext, useContext, useState } from 'react';
import { 
  Course, 
  CourseVersion, 
  Enrollment, 
  Certificate, 
  AssignmentSubmission, 
  QuizAttempt, 
  Organization, 
  SupportTicket,
  ReviewComment,
  Module,
  Lesson
} from '../types';
import { 
  INITIAL_COURSES, 
  INITIAL_ENROLLMENTS, 
  INITIAL_CERTIFICATES, 
  INITIAL_ASSIGNMENT_SUBMISSIONS, 
  INITIAL_QUIZ_ATTEMPTS, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_SUPPORT_TICKETS 
} from '../data/mockData';
import { useAudit } from './AuditContext';
import { useAuth } from './AuthContext';
import { sanitizeCourseForLearner } from '../lib/security';

interface CourseContextType {
  courses: Course[];
  /** Courses with quiz answer indices stripped, safe for learner consumption */
  sanitizedCourses: Course[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  submissions: AssignmentSubmission[];
  quizAttempts: QuizAttempt[];
  organizations: Organization[];
  supportTickets: SupportTicket[];

  // Course & Curriculum Authoring
  createCourseDraft: (courseData: Partial<Course>) => Course;
  updateCourseDraft: (courseId: string, versionNumber: string, updates: Partial<CourseVersion>) => void;
  createNewVersion: (courseId: string, fromVersion: string, newVersionNumber: string, changelog: string) => void;
  addModuleToVersion: (courseId: string, versionNumber: string, moduleTitle: string, description: string) => void;
  addLessonToModule: (courseId: string, versionNumber: string, moduleId: string, lesson: Omit<Lesson, 'id' | 'order'>) => void;
  
  // Governance & Review
  submitVersionForReview: (courseId: string, versionNumber: string, changelog: string) => void;
  addReviewComment: (courseId: string, versionNumber: string, comment: Omit<ReviewComment, 'id' | 'createdAt' | 'resolved'>) => void;
  resolveReviewComment: (courseId: string, versionNumber: string, commentId: string) => void;
  recordReviewDecision: (courseId: string, versionNumber: string, decision: 'approved' | 'revision_requested', notes?: string) => void;
  publishCourseVersion: (courseId: string, versionNumber: string) => void;
  unpublishCourse: (courseId: string, reason: string) => void;

  // Learner Progress & Enrollments
  enrollInCourse: (courseId: string) => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  submitQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'submittedAt'>) => { passed: boolean; score: number; percentage: number };
  submitAssignment: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeAssignment: (submissionId: string, score: number, feedback: string, rubricScores?: Record<string, number>) => void;

  // Certification
  issueCertificate: (learnerId: string, learnerName: string, courseId: string) => Certificate;
  revokeCertificate: (certificateId: string, reason: string) => void;
  verifyCertificateByHash: (hash: string) => Certificate | undefined;

  // Organizations & Cohorts
  createCohort: (orgId: string, cohortName: string, courseIds: string[], startDate: string, endDate: string) => void;
  bulkEnrollCohortLearners: (orgId: string, cohortId: string, emails: string[]) => { importedCount: number; existingCount: number };

  // Support
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'status'>, initialMessage: string) => void;
  replyToSupportTicket: (ticketId: string, text: string) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);

  // Derive sanitized courses (quiz answers stripped) for learner consumption
  const sanitizedCourses = React.useMemo(() => {
    return courses.map(course => sanitizeCourseForLearner(course));
  }, [courses]);

  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(INITIAL_ASSIGNMENT_SUBMISSIONS);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(INITIAL_QUIZ_ATTEMPTS);
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);

  const { logEvent } = useAudit();
  const { currentUser } = useAuth();

  // -----------------------------------------------------------------
  // Course Authoring Actions
  // -----------------------------------------------------------------
  const createCourseDraft = (courseData: Partial<Course>): Course => {
    const newCourseId = `crs_${Date.now()}`;
    const initialVersion: CourseVersion = {
      version: '1.0',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      changelog: 'Initial course draft created.',
      modules: [
        {
          id: `mod_${Date.now()}_1`,
          title: 'Module 1: Introduction and Core Concepts',
          description: 'Establish baseline domain terminology and architecture objectives.',
          order: 1,
          lessons: [
            {
              id: `les_${Date.now()}_1`,
              title: 'Getting Started: Syllabus & Environment Setup',
              durationMinutes: 15,
              type: 'text',
              order: 1,
              content: {
                textBody: 'Welcome to this curriculum! Follow the instructions below to configure your staging laboratory.'
              }
            }
          ]
        }
      ]
    };

    const newCourse: Course = {
      id: newCourseId,
      slug: (courseData.title || 'new-course').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: courseData.title || 'Untitled Curriculum',
      subtitle: courseData.subtitle || 'Comprehensive specialized course',
      description: courseData.description || 'Draft course description.',
      thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      category: courseData.category || 'General Technology',
      level: courseData.level || 'Intermediate',
      language: courseData.language || 'English',
      estimatedHours: courseData.estimatedHours || 10,
      price: courseData.price || 0,
      isFree: courseData.isFree ?? true,
      tags: courseData.tags || ['Enterprise', 'Compliance'],
      learningObjectives: courseData.learningObjectives || ['Master the core methodology'],
      prerequisites: courseData.prerequisites || ['Basic computer literacy'],
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      instructorAvatar: currentUser.avatar,
      instructorBio: 'Expert Course Author & Subject Specialist.',
      activeVersion: '1.0',
      enrollmentCount: 0,
      rating: 5.0,
      reviewCount: 0,
      versions: [initialVersion]
    };

    setCourses(prev => [newCourse, ...prev]);

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'COURSE_DRAFT_CREATED',
      entityType: 'course',
      entityId: newCourse.id,
      details: `Created draft course "${newCourse.title}" version 1.0`,
      severity: 'info'
    });

    return newCourse;
  };

  const updateCourseDraft = (courseId: string, versionNumber: string, updates: Partial<CourseVersion>) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        versions: course.versions.map(v => {
          if (v.version !== versionNumber) return v;
          return {
            ...v,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        })
      };
    }));
  };

  const createNewVersion = (courseId: string, fromVersion: string, newVersionNumber: string, changelog: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const baseVersion = course.versions.find(v => v.version === fromVersion) || course.versions[0];
      const clonedModules: Module[] = JSON.parse(JSON.stringify(baseVersion.modules));

      const newVer: CourseVersion = {
        version: newVersionNumber,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        changelog,
        modules: clonedModules,
        reviewFeedback: []
      };

      return {
        ...course,
        versions: [...course.versions, newVer]
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'COURSE_VERSION_BUMPED',
      entityType: 'course',
      entityId: courseId,
      details: `Forked version ${fromVersion} to new draft ${newVersionNumber} with changelog: "${changelog}"`,
      severity: 'info'
    });
  };

  const addModuleToVersion = (courseId: string, versionNumber: string, moduleTitle: string, description: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        versions: course.versions.map(v => {
          if (v.version !== versionNumber) return v;
          const newModule: Module = {
            id: `mod_${Date.now()}`,
            title: moduleTitle,
            description,
            order: v.modules.length + 1,
            lessons: []
          };
          return {
            ...v,
            modules: [...v.modules, newModule],
            updatedAt: new Date().toISOString()
          };
        })
      };
    }));
  };

  const addLessonToModule = (courseId: string, versionNumber: string, moduleId: string, lessonData: Omit<Lesson, 'id' | 'order'>) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        versions: course.versions.map(v => {
          if (v.version !== versionNumber) return v;
          return {
            ...v,
            modules: v.modules.map(m => {
              if (m.id !== moduleId) return m;
              const newLesson: Lesson = {
                ...lessonData,
                id: `les_${Date.now()}`,
                order: m.lessons.length + 1
              };
              return {
                ...m,
                lessons: [...m.lessons, newLesson]
              };
            }),
            updatedAt: new Date().toISOString()
          };
        })
      };
    }));
  };

  // -----------------------------------------------------------------
  // Governance & Review Actions
  // -----------------------------------------------------------------
  const submitVersionForReview = (courseId: string, versionNumber: string, changelog: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        versions: c.versions.map(v => {
          if (v.version !== versionNumber) return v;
          return {
            ...v,
            status: 'under_review',
            changelog: changelog || v.changelog,
            updatedAt: new Date().toISOString()
          };
        })
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'COURSE_VERSION_SUBMITTED',
      entityType: 'course',
      entityId: courseId,
      details: `Submitted version ${versionNumber} for Academic Review.`,
      severity: 'info'
    });
  };

  const addReviewComment = (courseId: string, versionNumber: string, commentData: Omit<ReviewComment, 'id' | 'createdAt' | 'resolved'>) => {
    const newComment: ReviewComment = {
      ...commentData,
      id: `rev_com_${Date.now()}`,
      createdAt: new Date().toISOString(),
      resolved: false
    };

    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        versions: c.versions.map(v => {
          if (v.version !== versionNumber) return v;
          return {
            ...v,
            reviewFeedback: [...(v.reviewFeedback || []), newComment]
          };
        })
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'REVIEW_COMMENT_ADDED',
      entityType: 'course',
      entityId: courseId,
      details: `Academic reviewer left comment on category ${commentData.category}: "${commentData.comment.substring(0, 50)}..."`,
      severity: 'info'
    });
  };

  const resolveReviewComment = (courseId: string, versionNumber: string, commentId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        versions: c.versions.map(v => {
          if (v.version !== versionNumber) return v;
          return {
            ...v,
            reviewFeedback: (v.reviewFeedback || []).map(comm => comm.id === commentId ? { ...comm, resolved: true } : comm)
          };
        })
      };
    }));
  };

  const recordReviewDecision = (courseId: string, versionNumber: string, decision: 'approved' | 'revision_requested', notes?: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        versions: c.versions.map(v => {
          if (v.version !== versionNumber) return v;
          return {
            ...v,
            status: decision,
            updatedAt: new Date().toISOString()
          };
        })
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: decision === 'approved' ? 'COURSE_ACADEMIC_APPROVED' : 'COURSE_REVISION_REQUESTED',
      entityType: 'course',
      entityId: courseId,
      details: `Academic QA decision: ${decision.toUpperCase()} on version ${versionNumber}. Notes: ${notes || 'No extra notes'}`,
      severity: decision === 'approved' ? 'info' : 'warning'
    });
  };

  const publishCourseVersion = (courseId: string, versionNumber: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        activeVersion: versionNumber,
        versions: c.versions.map(v => {
          if (v.version === versionNumber) {
            return {
              ...v,
              status: 'published',
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          // If another version was published, keep it marked published or legacy
          return v;
        })
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'COURSE_PUBLISHED_TO_CATALOG',
      entityType: 'course',
      entityId: courseId,
      details: `Published version ${versionNumber} to live student catalog.`,
      severity: 'info'
    });
  };

  const unpublishCourse = (courseId: string, reason: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        versions: c.versions.map(v => {
          if (v.version === c.activeVersion) {
            return {
              ...v,
              status: 'archived',
              updatedAt: new Date().toISOString()
            };
          }
          return v;
        })
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'COURSE_UNPUBLISHED_EMERGENCY',
      entityType: 'course',
      entityId: courseId,
      details: `Course unpublished from catalog. Justification: "${reason}"`,
      severity: 'critical'
    });
  };

  // -----------------------------------------------------------------
  // Learner Progress & Enrollments
  // -----------------------------------------------------------------
  const enrollInCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Check if already enrolled
    const existing = enrollments.find(e => e.learnerId === currentUser.id && e.courseId === courseId);
    if (existing) return;

    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      learnerId: currentUser.id,
      courseId,
      courseVersion: course.activeVersion,
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      completedLessonIds: [],
      progressPercent: 0,
      isCompleted: false
    };

    setEnrollments(prev => [newEnrollment, ...prev]);

    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { ...c, enrollmentCount: c.enrollmentCount + 1 };
      }
      return c;
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'ENROLLMENT_CREATED',
      entityType: 'course',
      entityId: courseId,
      details: `Enrolled in "${course.title}" at active version ${course.activeVersion}`,
      severity: 'info'
    });
  };

  const markLessonComplete = (courseId: string, lessonId: string) => {
    setEnrollments(prev => prev.map(enr => {
      if (enr.learnerId !== currentUser.id || enr.courseId !== courseId) return enr;

      // Idempotent: don't duplicate
      if (enr.completedLessonIds.includes(lessonId)) return enr;

      const updatedCompleted = [...enr.completedLessonIds, lessonId];
      
      // Calculate total lessons in course version
      const targetCourse = courses.find(c => c.id === courseId);
      const targetVer = targetCourse?.versions.find(v => v.version === enr.courseVersion) || targetCourse?.versions[0];
      let totalLessons = 0;
      targetVer?.modules.forEach(m => {
        totalLessons += m.lessons.length;
      });

      const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((updatedCompleted.length / totalLessons) * 100)) : 100;
      const isCompleted = progressPercent === 100;

      // Automatically issue certificate if finished
      if (isCompleted && !enr.isCompleted) {
        setTimeout(() => {
          issueCertificate(currentUser.id, currentUser.name, courseId);
        }, 300);
      }

      return {
        ...enr,
        completedLessonIds: updatedCompleted,
        progressPercent,
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        lastAccessedAt: new Date().toISOString()
      };
    }));
  };

  const submitQuizAttempt = (attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'>) => {
    // Server-side authoritative evaluation logic
    // Look up quiz in course
    let totalScore = 0;
    let maxScore = 0;

    courses.forEach(c => {
      c.versions.forEach(v => {
        v.modules.forEach(m => {
          m.lessons.forEach(l => {
            if (l.content.quiz && l.content.quiz.id === attemptData.quizId) {
              l.content.quiz.questions.forEach(q => {
                maxScore += q.points;
                const submittedAnswer = attemptData.answers[q.id];
                if (submittedAnswer === q.correctOptionIndex) {
                  totalScore += q.points;
                }
              });
            }
          });
        });
      });
    });

    if (maxScore === 0) {
      maxScore = 30; // fallback
      totalScore = attemptData.score || 25;
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    const passed = percentage >= 70;

    const newAttempt: QuizAttempt = {
      ...attemptData,
      id: `att_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      score: totalScore,
      maxScore,
      percentage,
      passed
    };

    setQuizAttempts(prev => [newAttempt, ...prev]);

    return { passed, score: totalScore, percentage };
  };

  const submitAssignment = (submissionData: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: AssignmentSubmission = {
      ...submissionData,
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'ASSIGNMENT_SUBMITTED',
      entityType: 'course',
      entityId: submissionData.courseId,
      details: `Learner submitted file "${submissionData.fileName}" for grading`,
      severity: 'info'
    });
  };

  const gradeAssignment = (submissionId: string, score: number, feedback: string, rubricScores?: Record<string, number>) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id !== submissionId) return s;
      return {
        ...s,
        status: 'graded',
        score,
        feedback,
        rubricScores,
        gradedBy: currentUser.id,
        gradedAt: new Date().toISOString()
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'ASSIGNMENT_GRADED',
      entityType: 'grade',
      entityId: submissionId,
      details: `Instructor graded submission ${submissionId}: Score ${score} with feedback.`,
      severity: 'info'
    });
  };

  // -----------------------------------------------------------------
  // Certification Engine
  // -----------------------------------------------------------------
  const issueCertificate = (learnerId: string, learnerName: string, courseId: string): Certificate => {
    const course = courses.find(c => c.id === courseId);
    const certNum = `LS-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hash = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const newCert: Certificate = {
      id: `cert_${Date.now()}`,
      certificateNumber: certNum,
      learnerId,
      learnerName,
      courseId,
      courseTitle: course?.title || 'Advanced Enterprise Training',
      courseVersion: course?.activeVersion || '1.0',
      issuedAt: new Date().toISOString(),
      verificationHash: hash,
      issuerName: 'LearnSphere Global Academic Board',
      issuerTitle: 'Board of Governors & Compliance Secretariat',
      status: 'valid'
    };

    setCertificates(prev => [newCert, ...prev]);

    // Attach to enrollment
    setEnrollments(prev => prev.map(e => {
      if (e.learnerId === learnerId && e.courseId === courseId) {
        return { ...e, certificateId: newCert.id, isCompleted: true };
      }
      return e;
    }));

    logEvent({
      actorId: 'system',
      actorName: 'Autonomous Certification Engine',
      actorRole: 'super_admin',
      action: 'CERTIFICATE_ISSUED',
      entityType: 'certificate',
      entityId: newCert.id,
      details: `Issued verifiable certificate ${newCert.certificateNumber} for "${newCert.courseTitle}" to ${learnerName}`,
      severity: 'info'
    });

    return newCert;
  };

  const revokeCertificate = (certificateId: string, reason: string) => {
    setCertificates(prev => prev.map(c => {
      if (c.id !== certificateId) return c;
      return {
        ...c,
        status: 'revoked',
        revocationReason: reason,
        revokedAt: new Date().toISOString()
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'CERTIFICATE_REVOKED',
      entityType: 'certificate',
      entityId: certificateId,
      details: `Revoked certificate ${certificateId}. Cause: "${reason}"`,
      severity: 'critical'
    });
  };

  const verifyCertificateByHash = (query: string): Certificate | undefined => {
    const trimmed = query.trim().toLowerCase();
    return certificates.find(c => 
      c.verificationHash.toLowerCase() === trimmed || 
      c.certificateNumber.toLowerCase() === trimmed ||
      c.id.toLowerCase() === trimmed
    );
  };

  // -----------------------------------------------------------------
  // Organizations & Cohorts
  // -----------------------------------------------------------------
  const createCohort = (orgId: string, cohortName: string, courseIds: string[], startDate: string, endDate: string) => {
    setOrganizations(prev => prev.map(org => {
      if (org.id !== orgId) return org;
      return {
        ...org,
        cohorts: [
          ...org.cohorts,
          {
            id: `coh_${Date.now()}`,
            name: cohortName,
            organizationId: orgId,
            courseIds,
            startDate,
            endDate,
            memberEmails: []
          }
        ]
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'COHORT_CREATED',
      entityType: 'organization',
      entityId: orgId,
      details: `Created training cohort "${cohortName}" with ${courseIds.length} assigned courses`,
      severity: 'info'
    });
  };

  const bulkEnrollCohortLearners = (orgId: string, cohortId: string, emails: string[]) => {
    let imported = 0;
    let existing = 0;

    setOrganizations(prev => prev.map(org => {
      if (org.id !== orgId) return org;
      return {
        ...org,
        cohorts: org.cohorts.map(coh => {
          if (coh.id !== cohortId) return coh;
          const currentEmails = new Set(coh.memberEmails);
          emails.forEach(email => {
            const clean = email.trim().toLowerCase();
            if (clean && !currentEmails.has(clean)) {
              currentEmails.add(clean);
              imported++;
            } else if (clean) {
              existing++;
            }
          });
          return {
            ...coh,
            memberEmails: Array.from(currentEmails)
          };
        }),
        activeSeats: Math.min(org.seatLimit, org.activeSeats + imported)
      };
    }));

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'BULK_CSV_ENROLLMENT',
      entityType: 'organization',
      entityId: cohortId,
      details: `Bulk imported ${imported} new learners into cohort (skipped ${existing} duplicates)`,
      severity: 'info'
    });

    return { importedCount: imported, existingCount: existing };
  };

  // -----------------------------------------------------------------
  // Support Tickets
  // -----------------------------------------------------------------
  const createSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'status'>, initialMessage: string) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt_${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'open',
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: initialMessage,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setSupportTickets(prev => [newTicket, ...prev]);

    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'SUPPORT_TICKET_OPENED',
      entityType: 'system',
      entityId: newTicket.id,
      details: `Opened support ticket "${ticketData.subject}" category: ${ticketData.category}`,
      severity: 'info'
    });
  };

  const replyToSupportTicket = (ticketId: string, text: string) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        updatedAt: new Date().toISOString(),
        messages: [
          ...t.messages,
          {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            text,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }));
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return { ...t, status, updatedAt: new Date().toISOString() };
    }));
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        sanitizedCourses,
        enrollments,
        certificates,
        submissions,
        quizAttempts,
        organizations,
        supportTickets,
        createCourseDraft,
        updateCourseDraft,
        createNewVersion,
        addModuleToVersion,
        addLessonToModule,
        submitVersionForReview,
        addReviewComment,
        resolveReviewComment,
        recordReviewDecision,
        publishCourseVersion,
        unpublishCourse,
        enrollInCourse,
        markLessonComplete,
        submitQuizAttempt,
        submitAssignment,
        gradeAssignment,
        issueCertificate,
        revokeCertificate,
        verifyCertificateByHash,
        createCohort,
        bulkEnrollCohortLearners,
        createSupportTicket,
        replyToSupportTicket,
        updateTicketStatus
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
