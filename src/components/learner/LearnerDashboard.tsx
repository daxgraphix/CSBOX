import React from 'react';
import { BookOpen, 
  CheckCircle, 
  Clock, 
  Award, 
  PlayCircle, 
  FileText, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Certificate } from '../../types';

interface LearnerDashboardProps {
  onStartCourse: (courseId: string) => void;
  onExploreCatalog: () => void;
  onViewCertificate: (cert: Certificate) => void;
  onNavigateToTasks?: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({ 
  onStartCourse, 
  onExploreCatalog,
  onViewCertificate,
  onNavigateToTasks
}) => {
  const { courses, enrollments, certificates, submissions } = useCourse();
  const { currentUser } = useAuth();

  const userEnrollments = enrollments.filter(e => e.learnerId === currentUser.id);
  const userCertificates = certificates.filter(c => c.learnerId === currentUser.id);
  const userSubmissions = submissions.filter(s => s.learnerId === currentUser.id);

  const completedCount = userEnrollments.filter(e => e.isCompleted).length;
  const inProgressCount = userEnrollments.filter(e => !e.isCompleted).length;

  return (
    <div className="space-y-8 py-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learner Portal • Academic Term 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            You are enrolled in {userEnrollments.length} enterprise curricula. Continue your lessons to maintain your learning streak and earn verified credentials.
          </p>
        </div>

        <button
          onClick={onExploreCatalog}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse More Courses</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Enrolled Curricula</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{userEnrollments.length}</div>
          <div className="text-[11px] text-slate-400">{inProgressCount} currently active</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Completed Courses</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium">100% requirements met</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Issued Credentials</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{userCertificates.length}</div>
          <div className="text-[11px] text-amber-700 font-medium">Cryptographically signed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Assignments &amp; Labs</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{userSubmissions.length}</div>
          <div className="text-[11px] text-slate-400">Submissions on record</div>
        </div>

      </div>

      {/* Priority Lab Tasks & Deadlines Banner */}
      {onNavigateToTasks && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">3 Assigned Tasks &amp; Sandbox Labs Due Soon</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete Calico Zero-Trust lab, submit Module 2 quiz, and review faculty scores.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToTasks}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Open Tasks Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Courses Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Enrolled Courses</h2>

        {userEnrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Active Enrollments Yet</h3>
            <p className="text-xs text-slate-500">Explore the enterprise catalog and start learning today.</p>
            <button
              onClick={onExploreCatalog}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userEnrollments.map(enr => {
              const course = courses.find(c => c.id === enr.courseId);
              if (!course) return null;

              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {course.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1.5 leading-snug">
                          {course.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md shrink-0">
                        v{enr.courseVersion}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Progress</span>
                        <span className="font-bold text-slate-800 font-mono">{enr.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            enr.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${enr.progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {enr.completedLessonIds.length} lessons completed
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    {enr.isCompleted ? (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Curriculum Completed</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Last active: {new Date(enr.lastAccessedAt).toLocaleDateString()}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {enr.certificateId && (
                        <button
                          onClick={() => {
                            const cert = certificates.find(c => c.id === enr.certificateId);
                            if (cert) onViewCertificate(cert);
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>View Credential</span>
                        </button>
                      )}

                      <button
                        onClick={() => onStartCourse(course.id)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{enr.isCompleted ? 'Review Player' : 'Resume'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Learning Streak & Progress Insights */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            <span>Learning Momentum</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">7</div>
              <div className="text-xs text-blue-300">Day Streak</div>
            </div>
            <div className="w-px h-8 bg-slate-600"></div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">84%</div>
              <div className="text-xs text-blue-300">Completion Rate</div>
            </div>
            <div className="w-px h-8 bg-slate-600"></div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">12h</div>
              <div className="text-xs text-blue-300">This Week</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span className="text-sm font-semibold text-white">You're ahead of your learning pace this term</span>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.filter(c => !userEnrollments.some(e => e.courseId === c.id)).slice(0, 3).map(course => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-600 font-medium">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                    {course.subtitle}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{course.estimatedHours} hours</span>
                <span>{course.price === 0 ? 'Free' : `$${course.price}`}</span>
              </div>
              <button
                onClick={() => onStartCourse(course.id)}
                className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Start Learning
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Earned Certificates Shelf */}
      {userCertificates.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Your Verified Academic Credentials</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{userCertificates.length} credentials valid</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCertificates.map(cert => (
              <div
                key={cert.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{cert.courseTitle}</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Serial: <span className="font-semibold text-slate-700">{cert.certificateNumber}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => onViewCertificate(cert)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-sm transition-colors"
                >
                  Inspect &amp; Print
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
