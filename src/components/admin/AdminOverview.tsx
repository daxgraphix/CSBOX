import React from 'react';
import { 
  BookOpen, 
  Users, 
  FileCheck, 
  Award, 
  ArrowRight, 
  PlusCircle, 
  CheckCircle, 
  TrendingUp,
  ShieldCheck,
  GitBranch,
  Clock,
  User,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types';

interface AdminOverviewProps {
  onOpenCourseStudio: (courseId: string) => void;
  onOpenGrading: () => void;
  onOpenCatalog: () => void;
  onNavigateToTasks?: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onOpenCourseStudio,
  onOpenGrading,
  onOpenCatalog,
  onNavigateToTasks,
}) => {
  const { courses, submissions, certificates } = useCourse();
  const { currentUser } = useAuth();

  const totalEnrollments = courses.reduce((acc, c) => acc + c.enrollmentCount, 0);
  const pendingGrading = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-300 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{currentUser.role === 'super_admin' ? 'Super Admin Governance Console' : 'Academic Course Administrator'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Manage course curriculum versions, evaluate student capstones against rubrics, and publish verified academic credentials.
          </p>
        </div>

        <button
          onClick={() => onOpenCourseStudio(courses[0]?.id || 'crs_sec_01')}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Open Course Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Active Curricula</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{courses.length}</div>
          <div className="text-[11px] text-slate-400">Published &amp; draft revisions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Enrolled Students</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalEnrollments.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Active learners</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-purple-600" />
            <span>Pending Submissions</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{pendingGrading}</div>
          <div className="text-[11px] text-purple-600 font-medium">Awaiting rubric grading</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Issued Certificates</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{certificates.length}</div>
          <div className="text-[11px] text-amber-700 font-medium">Verifiable credentials</div>
        </div>

      </div>

      {/* Role-Based Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {currentUser.role === 'super_admin' && (
            <>
              <button
                onClick={() => onOpenCourseStudio(courses[0]?.id || 'crs_sec_01')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </button>
              <button
                onClick={() => onOpenCatalog()}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Audit Trail</span>
              </button>
            </>
          )}
          {currentUser.role === 'admin' || currentUser.role === 'super_admin' && (
            <>
              <button
                onClick={onOpenGrading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                <span>Grading Queue</span>
              </button>
              <button
                onClick={() => onOpenCourseStudio(courses[0]?.id || 'crs_sec_01')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Course Builder</span>
              </button>
            </>
          )}
          {currentUser.role === 'instructor' && (
            <>
              <button
                onClick={() => onOpenCourseStudio(courses[0]?.id || 'crs_sec_01')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses</span>
              </button>
              <button
                onClick={onOpenGrading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                <span>Grade Submissions</span>
              </button>
            </>
          )}
          {currentUser.role === 'reviewer' && (
            <>
              <button
                onClick={onOpenGrading}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Review Queue</span>
              </button>
              <button
                onClick={() => onOpenCatalog()}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Course Catalog</span>
              </button>
            </>
          )}
          {currentUser.role === 'support' && (
            <>
              <button
                onClick={() => onOpenCatalog()}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>User Lookup</span>
              </button>
              <button
                onClick={() => onOpenCatalog()}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Ticket History</span>
              </button>
            </>
          )}
          {currentUser.role === 'organization' && (
            <>
              <button
                onClick={() => onOpenCourseStudio(courses[0]?.id || 'crs_sec_01')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Org Courses</span>
              </button>
              <button
                onClick={() => onOpenCatalog()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Cohort Members</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Role Action & Governance Tasks Banner */}
      {onNavigateToTasks && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {currentUser.role === 'super_admin' ? 'Root Governance & Compliance Action Items' : 'Instructional Queue & Grading Deadlines'}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  Priority Tasks
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentUser.role === 'super_admin'
                  ? 'Approve catalog releases, audit IAM privilege delegations, and verify database integrity.'
                  : 'Evaluate capstone submissions against rubrics, audit course drafts, and address student queries.'}
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

      {/* Courses Studio Shelf */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Curriculum Studio &amp; Active Versions</h2>
          <button
            onClick={onOpenCatalog}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {courses.map(course => {
            const activeVer = course.versions.find(v => v.version === course.activeVersion) || course.versions[0];
            return (
              <div
                key={course.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        v{course.activeVersion} ({activeVer.status})
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{course.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {course.enrollmentCount.toLocaleString()} students enrolled • {activeVer.modules.length} modules
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onOpenCourseStudio(course.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Open Curriculum Builder
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action to Grading if pending */}
      {pendingGrading > 0 && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-purple-900 text-sm">{pendingGrading} Capstone Submissions Awaiting Grading</h4>
              <p className="text-xs text-purple-700">Review learner architecture diagrams, threat models, and grade rubrics.</p>
            </div>
          </div>

          <button
            onClick={onOpenGrading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
          >
            Launch Grading Studio
          </button>
        </div>
      )}

    </div>
  );
};
