import React, { useState } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  Clock, 
  Users, 
  GitBranch, 
  CheckSquare, 
  Edit3, 
  ArrowRight,
  Send,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Course, Enrollment } from '../../types';

interface InstructorDashboardProps {
  onOpenBuilder: (courseId: string) => void;
  onOpenGrading: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ 
  onOpenBuilder, 
  onOpenGrading 
}) => {
  const { courses, submissions, enrollments, createCourseDraft } = useCourse();
  const { currentUser } = useAuth();

  const [newTitle, setNewTitle] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // Instructors can manage their assigned courses, super admin can manage all
  const myCourses = currentUser.role === 'super_admin' 
    ? courses 
    : courses.filter(c => c.instructorId === currentUser.id);

  const pendingGradingCount = submissions.filter(s => s.status === 'pending').length;

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createCourseDraft({
      title: newTitle,
      category: 'Cloud Engineering',
      level: 'Intermediate',
      estimatedHours: 12,
      price: 99,
      isFree: false
    });

    setNewTitle('');
    setShowNewModal(false);
    onOpenBuilder(created.id);
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Course Authoring &amp; Curriculum Governance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Instructor Studio
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Build specialized curricula, manage draft revisions, version branching, and evaluate learner assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGrading}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-purple-600" />
            <span>Grading Queue ({pendingGradingCount})</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course Draft</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Managed Curricula</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{myCourses.length}</div>
          <div className="text-[11px] text-slate-400">Assigned course records</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Total Enrolled Learners</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {myCourses.reduce((acc, c) => acc + c.enrollmentCount, 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Across all published versions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-indigo-600" />
            <span>Active Versions</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {myCourses.reduce((acc, c) => acc + c.versions.length, 0)}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium">Published &amp; draft revisions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-purple-600" />
            <span>Submissions to Grade</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{pendingGradingCount}</div>
          <div className="text-[11px] text-purple-700 font-medium">Requiring faculty review</div>
        </div>

      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Course Catalog &amp; Revisions</h2>

        <div className="space-y-4">
          {myCourses.map(course => {
            const activeVer = course.versions.find(v => v.version === course.activeVersion) || course.versions[0];
            const draftVer = course.versions.find(v => v.status === 'draft' || v.status === 'under_review' || v.status === 'revision_requested');

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono text-slate-600 font-medium">
                        Active: v{course.activeVersion} ({activeVer.status})
                      </span>
                      {draftVer && draftVer.version !== course.activeVersion && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                          Revision v{draftVer.version} ({draftVer.status})
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base truncate max-w-xl">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                      {course.subtitle}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>{course.enrollmentCount.toLocaleString()} enrolled</span>
                      <span>•</span>
                      <span>{activeVer.modules.length} modules</span>
                      <span>•</span>
                      <span>{course.versions.length} versions logged</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                  <button
                    onClick={() => onOpenBuilder(course.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Curriculum Studio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Progress Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Learner Progress &amp; Submissions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {myCourses.map(course => {
            const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
            const completedCount = courseEnrollments.filter(e => e.isCompleted).length;
            const avgProgress = courseEnrollments.length > 0
              ? Math.round(courseEnrollments.reduce((acc, e) => acc + e.progressPercent, 0) / courseEnrollments.length)
              : 0;
            const pendingSubs = submissions.filter(s => s.courseId === course.id && s.status === 'pending').length;

            return (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{course.title}</h4>
                    <p className="text-xs text-slate-500">{course.category}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    v{course.activeVersion}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Enrolled Learners</span>
                    <span className="font-semibold text-slate-900">{courseEnrollments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Completed</span>
                    <span className="font-semibold text-emerald-600">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Avg Progress</span>
                    <span className="font-semibold text-indigo-600">{avgProgress}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pending Grading</span>
                    <span className="font-semibold text-amber-600">{pendingSubs}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Course Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Create New Course Draft</h3>
            <p className="text-xs text-slate-500">
              This initiates version 1.0 in draft state. It will not be visible to learners until approved by Academic QA.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Incident Response & Threat Hunting"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
