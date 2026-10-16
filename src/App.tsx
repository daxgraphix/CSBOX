import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { CourseProvider, useCourse } from './context/CourseContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { AccountSuspendedNotice } from './components/common/AccountSuspendedNotice';
import { CertificateModal } from './components/common/CertificateModal';
import { CertificateRegistry } from './components/common/CertificateRegistry';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Skeleton, SkeletonCard, SkeletonList, SkeletonText } from './components/common/LoadingSkeleton';
import { LoginScreen } from './components/common/LoginScreen';
import { SignupScreen } from './components/common/SignupScreen';

// Lazy-loaded components for code splitting (performance optimization)
const LearnKastsCourseEditor = lazy(() =>
  import('./components/course/LearnKastsCourseEditor').then(
    mod => ({ default: mod.LearnKastsCourseEditor })
  )
);
const CoursePlayer = lazy(() =>
  import('./components/learner/CoursePlayer').then(
    mod => ({ default: mod.CoursePlayer })
  )
);
const LearnerDashboard = lazy(() =>
  import('./components/learner/LearnerDashboard').then(
    mod => ({ default: mod.LearnerDashboard })
  )
);
const StudentAssessmentsView = lazy(() =>
  import('./components/learner/StudentAssessmentsView').then(
    mod => ({ default: mod.StudentAssessmentsView })
  )
);
const RoleTasksView = lazy(() =>
  import('./components/common/RoleTasksView').then(
    mod => ({ default: mod.RoleTasksView })
  )
);
const CourseCatalog = lazy(() =>
  import('./components/public/CourseCatalog').then(
    mod => ({ default: mod.CourseCatalog })
  )
);
const CourseDetail = lazy(() =>
  import('./components/public/CourseDetail').then(
    mod => ({ default: mod.CourseDetail })
  )
);
const VerifyCertificate = lazy(() =>
  import('./components/public/VerifyCertificate').then(
    mod => ({ default: mod.VerifyCertificate })
  )
);
const GradingStudio = lazy(() =>
  import('./components/instructor/GradingStudio').then(
    mod => ({ default: mod.GradingStudio })
  )
);
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then(
    mod => ({ default: mod.AdminDashboard })
  )
);
const AdminOverview = lazy(() =>
  import('./components/admin/AdminOverview').then(
    mod => ({ default: mod.AdminOverview })
  )
);
const IntegrationsView = lazy(() =>
  import('./components/admin/IntegrationsView').then(
    mod => ({ default: mod.IntegrationsView })
  )
);
const SupportCenter = lazy(() =>
  import('./components/support/SupportCenter').then(
    mod => ({ default: mod.SupportCenter })
  )
);

import { Certificate } from './types';
import { 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Menu,
  Box,
  Terminal,
  CheckCircle2
} from 'lucide-react';

const MainShell: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, certificates } = useCourse();

  // Sidebar navigation state (defaulting to appropriate home screen)
  const [activeNav, setActiveNav] = useState<NavItemKey>(
    currentUser.role === 'student' ? 'dashboard' : 'courses'
  );
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Active selected course for editor & player
  const [activeCourseId, setActiveCourseId] = useState<string>('crs_sec_01');

  // Preview / Player state
  const [viewingCourseDetailId, setViewingCourseDetailId] = useState<string | null>(null);

  // Modals & Preview Overlay
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [studentPreviewCourseId, setStudentPreviewCourseId] = useState<string | null>(null);

  // Mobile sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Strictly enforce role-based screen boundaries
  useEffect(() => {
    if (currentUser.role === 'student') {
      const allowedStudentNavs: NavItemKey[] = ['dashboard', 'tasks', 'courses', 'catalog', 'assessments', 'certificates', 'support'];
      if (!allowedStudentNavs.includes(activeNav)) {
        setActiveNav('dashboard');
      }
    } else if (currentUser.role === 'admin') {
      const allowedAdminNavs: NavItemKey[] = ['dashboard', 'tasks', 'courses', 'grading', 'catalog', 'certificates', 'integrations', 'support'];
      if (!allowedAdminNavs.includes(activeNav)) {
        setActiveNav('dashboard');
      }
    }
  }, [currentUser.role, activeNav]);

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 selection:bg-blue-500 selection:text-white">
      
      {/* 1. Left Sidebar strictly role-adapted with mobile drawer support */}
      <Sidebar
        activeKey={activeNav}
        onSelectKey={key => {
          setViewingCourseDetailId(null);
          setActiveNav(key);
        }}
        isCompact={isCompact}
        onToggleCompact={() => setIsCompact(!isCompact)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setIsMobileOpen(false)}
        />
      )}

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        
        {/* Account Suspended Banner (if applicable) */}
        <AccountSuspendedNotice />

        {/* Global Top Mini Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
              title="Open Navigation"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-1">
              <span className="font-semibold text-slate-700 text-sm">
                {activeNav.replace('_', ' ')}
              </span>
              <span className="w-px h-3 bg-slate-300"></span>
              <span className="text-slate-500 font-mono text-[10px]">
                Role: <strong className="uppercase text-slate-800">{currentUser.role.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Course Selector (Admin / Super Admin Course Studio) */}
            {activeNav === 'courses' && currentUser.role !== 'student' && (
              <div className="flex items-center gap-2">
                <select
                  value={activeCourseId}
                  onChange={e => setActiveCourseId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer max-w-[200px] sm:max-w-xs truncate focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} (v{c.activeVersion})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Direct .ZIP Download button */}
            <button
              onClick={() => setZipModalOpen(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Project</span>
              <span className="font-mono bg-blue-500 px-1 py-0.5 rounded text-[10px]">.ZIP</span>
            </button>
          </div>
        </header>

        {/* Main Content Area with Suspense for code-split components */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Suspense fallback={
            <div className="h-full flex items-center justify-center">
              <SkeletonCard className="max-w-lg mx-auto" />
            </div>
          }>
            
            {/* ============================================================ */}
            {/* ROLE 1: NORMAL STUDENT (Few screens only, hyper-focused)     */}
            {/* ============================================================ */}
            {currentUser.role === 'student' && (
              <>
                {/* 1. Student Dashboard */}
                {activeNav === 'dashboard' && (
                  <LearnerDashboard
                    onStartCourse={id => {
                      setActiveCourseId(id);
                      setActiveNav('courses');
                    }}
                    onExploreCatalog={() => setActiveNav('catalog')}
                    onViewCertificate={cert => setSelectedCert(cert)}
                    onNavigateToTasks={() => setActiveNav('tasks')}
                  />
                )}

                {/* 2. Assigned Tasks & Sandbox Labs */}
                {activeNav === 'tasks' && (
                  <RoleTasksView
                    onNavigate={(target, param) => {
                      if (param) setActiveCourseId(param);
                      setActiveNav(target as NavItemKey);
                    }}
                  />
                )}

                {/* 3. My Learning & Interactive Course Player */}
                {activeNav === 'courses' && (
                  <CoursePlayer
                    courseId={activeCourseId}
                    onBack={() => setActiveNav('dashboard')}
                    onViewCertificate={cert => setSelectedCert(cert)}
                  />
                )}

                {/* 4. Explore Catalog & Enroll */}
                {activeNav === 'catalog' && (
                  viewingCourseDetailId ? (
                    <CourseDetail
                      courseId={viewingCourseDetailId}
                      onBack={() => setViewingCourseDetailId(null)}
                      onStartLearning={id => {
                        setActiveCourseId(id);
                        setViewingCourseDetailId(null);
                        setActiveNav('courses');
                      }}
                    />
                  ) : (
                    <CourseCatalog
                      onSelectCourse={id => setViewingCourseDetailId(id)}
                    />
                  )
                )}

                {/* 5. My Quizzes & Grades */}
                {activeNav === 'assessments' && (
                  <StudentAssessmentsView
                    onOpenCoursePlayer={id => {
                      setActiveCourseId(id);
                      setActiveNav('courses');
                    }}
                  />
                )}

                {/* 6. My Certificates */}
                {activeNav === 'certificates' && (
                  <>
                    <CertificateRegistry
                      certificates={certificates.filter(c => c.learnerId === currentUser.id)}
                      variant="student"
                      onInspect={cert => setSelectedCert(cert)}
                    />

                    <VerifyCertificate
                      onBack={() => setActiveNav('dashboard')}
                      onViewModal={cert => setSelectedCert(cert)}
                    />
                  </>
                )}

                {/* 7. Support Desk */}
                {activeNav === 'support' && <SupportCenter />}
              </>
            )}

            {/* ============================================================ */}
            {/* ROLE 2: ADMIN (Course Author, Grader, Academic Supervisor)   */}
            {/* ============================================================ */}
            {currentUser.role === 'admin' && (
              <>
                {/* 1. Admin Overview */}
                {activeNav === 'dashboard' && (
                  <AdminOverview
                    onOpenCourseStudio={id => {
                      setActiveCourseId(id);
                      setActiveNav('courses');
                    }}
                    onOpenGrading={() => setActiveNav('grading')}
                    onOpenCatalog={() => setActiveNav('catalog')}
                    onNavigateToTasks={() => setActiveNav('tasks')}
                  />
                )}

                {/* 2. Instructional Tasks */}
                {activeNav === 'tasks' && (
                  <RoleTasksView
                    onNavigate={(target, param) => {
                      if (param) setActiveCourseId(param);
                      setActiveNav(target as NavItemKey);
                    }}
                  />
                )}

                {/* 3. Course Studio */}
                {activeNav === 'courses' && (
                  <LearnKastsCourseEditor
                    courseId={activeCourseId}
                    onPreviewAsStudent={id => {
                      setStudentPreviewCourseId(id);
                    }}
                    onNavigateBreadcrumb={target => setActiveNav(target as NavItemKey)}
                  />
                )}

                {/* 4. Student Grading Studio */}
                {activeNav === 'grading' && (
                  <GradingStudio
                    onBack={() => setActiveNav('dashboard')}
                  />
                )}

                {/* 5. Course Catalog */}
                {activeNav === 'catalog' && (
                  <CourseCatalog
                    onSelectCourse={id => {
                      setActiveCourseId(id);
                      setActiveNav('courses');
                    }}
                  />
                )}

                {/* 6. Certificates Registry */}
                {activeNav === 'certificates' && (
                  <>
                    <CertificateRegistry
                      certificates={certificates}
                      showLearnerName
                      variant="admin"
                      onInspect={cert => setSelectedCert(cert)}
                    />

                    <VerifyCertificate
                      onBack={() => setActiveNav('dashboard')}
                      onViewModal={cert => setSelectedCert(cert)}
                    />
                  </>
                )}

                {/* 7. Integrations (Webhooks & APIs) */}
                {activeNav === 'integrations' && <IntegrationsView />}

                {/* 8. Support Desk */}
                {activeNav === 'support' && <SupportCenter />}
              </>
            )}

            {/* ============================================================ */}
            {/* ROLE 3: SUPER ADMIN (Root Governance, IAM, Audit, Health)    */}
            {/* ============================================================ */}
            {currentUser.role === 'super_admin' && (
              <>
                {/* 1. Dashboard Overview */}
                {activeNav === 'dashboard' && (
                  <AdminOverview
                    onOpenCourseStudio={id => {
                      setActiveCourseId(id);
                      setActiveNav('courses');
                    }}
                    onOpenGrading={() => setActiveNav('grading')}
                    onOpenCatalog={() => setActiveNav('catalog')}
                    onNavigateToTasks={() => setActiveNav('tasks')}
                  />
                )}

                {/* 2. Platform Governance Tasks */}
                {activeNav === 'tasks' && (
                  <RoleTasksView
                    onNavigate={(target, param) => {
                      if (param) setActiveCourseId(param);
                      setActiveNav(target as NavItemKey);
                    }}
                  />
                )}

                {/* 3. Course Studio (Full Publish / Unpublish Governance) */}
                {activeNav === 'courses' && (
                  <LearnKastsCourseEditor
                    courseId={activeCourseId}
                    onPreviewAsStudent={id => {
                      setStudentPreviewCourseId(id);
                    }}
                    onNavigateBreadcrumb={target => setActiveNav(target as NavItemKey)}
                  />
                )}

                {/* 4. Student Grading */}
                {activeNav === 'grading' && (
                  <GradingStudio
                    onBack={() => setActiveNav('dashboard')}
                  />
                )}

                {/* 5. Course Catalog */}
                {activeNav === 'catalog' && (
                  <CourseCatalog
                    onSelectCourse={id => {
                      setActiveCourseId(id);
                      setActiveNav('courses');
                    }}
                  />
                )}

                {/* 6. Certificates Registry & Verification */}
                {activeNav === 'certificates' && (
                  <>
                    <CertificateRegistry
                      certificates={certificates}
                      showLearnerName
                      variant="super_admin"
                      onInspect={cert => setSelectedCert(cert)}
                    />

                    <VerifyCertificate
                      onBack={() => setActiveNav('dashboard')}
                      onViewModal={cert => setSelectedCert(cert)}
                    />
                  </>
                )}

                {/* 7. User Management & IAM (Super Admin exclusive) */}
                {activeNav === 'users' && <AdminDashboard />}

                {/* 8. Audit Logs (Super Admin exclusive) */}
                {activeNav === 'audit' && <AdminDashboard />}

                {/* 9. Integrations (Webhooks & APIs) */}
                {activeNav === 'integrations' && <IntegrationsView />}

                {/* 10. System Health & Operations (Super Admin exclusive) */}
                {activeNav === 'health' && <AdminDashboard />}

                {/* 11. Enterprise Plan */}
                {activeNav === 'my_plan' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 max-w-4xl mx-auto shadow-xs">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="text-xl font-bold text-slate-900">Csbox Enterprise Platform Tier</h2>
                      <p className="text-xs text-slate-500">Platform governance license, dedicated PostgreSQL instance and sandbox container specs.</p>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Super Admin License</span>
                      <h3 className="text-2xl font-extrabold">Csbox Cloud Academy &amp; Multi-Tenant Sandbox</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        PostgreSQL 16 with Row-Level Security (RLS), append-only immutable audit logging, live container terminal sandbox, and SHA-256 verifiable credentials.
                      </p>
                    </div>
                  </div>
                )}

                {/* 12. Support Operations */}
                {activeNav === 'support' && <SupportCenter />}
              </>
            )}
          </Suspense>
        </main>

      </div>

      {/* Student Preview Modal Simulation */}
      {studentPreviewCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col">
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Student Preview Simulation Mode
              </span>
              <span className="text-slate-300 font-medium hidden sm:inline">
                Simulating learner sandbox &amp; terminal environment (no grade modifications)
              </span>
            </div>
            <button
              onClick={() => setStudentPreviewCourseId(null)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Exit Student Preview
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900">
            <div className="max-w-6xl mx-auto">
              <CoursePlayer
                courseId={studentPreviewCourseId}
                onBack={() => setStudentPreviewCourseId(null)}
                onViewCertificate={cert => setSelectedCert(cert)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Project .ZIP Code Inspector & Download Modal */}
      <ProjectZipModal
        isOpen={zipModalOpen}
        onClose={() => setZipModalOpen(false)}
      />

      {/* Official Verifiable Certificate Modal */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={selectedCert !== null}
        onClose={() => setSelectedCert(null)}
      />

    </div>
  );
};

export default function App() {
  const { isAuthenticated, isLoadingSession } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  // Show loading spinner while restoring session from localStorage
  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthProvider>
        <AuditProvider>
          <CourseProvider>
            <ErrorBoundary fallback={<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"><h3 className="text-lg font-bold mb-2">Application Error</h3><p className="mb-4">An unexpected error occurred. Please refresh the page.</p></div>}>
              {showSignup ? (
                <SignupScreen />
              ) : (
                <LoginScreen />
              )}
            </ErrorBoundary>
          </CourseProvider>
        </AuditProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AuditProvider>
        <CourseProvider>
          <ErrorBoundary fallback={<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"><h3 className="text-lg font-bold mb-2">Application Error</h3><p className="mb-4">An unexpected error occurred. Please refresh the page.</p></div>}>
            <MainShell />
          </ErrorBoundary>
        </CourseProvider>
      </AuditProvider>
    </AuthProvider>
  );
}
