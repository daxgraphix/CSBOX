import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Award, 
  Lock, 
  BookOpen, 
  Server, 
  Download, 
  CheckCircle2, 
  Users, 
  FileCode,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

interface PublicHomeProps {
  onSelectCourse: (courseId: string) => void;
  onExploreCatalog: () => void;
  onOpenZipModal: () => void;
  onOpenVerify: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ 
  onSelectCourse, 
  onExploreCatalog, 
  onOpenZipModal,
  onOpenVerify
}) => {
  const { courses } = useCourse();
  const { setActivePortal, switchUser, allUsers } = useAuth();

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 sm:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Next-Generation Learning Governance &amp; Multi-Role LMS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Architected for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Regulated</span> Enterprise Learning.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            A unified modular monolith separating the public learning experience, authoring studio, course governance, and tamper-evident compliance audit trails. Built with PostgreSQL RLS, Express backend, and full project source code export.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onExploreCatalog}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:gap-3"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenZipModal}
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-semibold text-sm rounded-xl border border-slate-700 flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Full Project (.ZIP)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActivePortal('learner');
                }}
                className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 text-sm font-medium rounded-lg border border-slate-500/30 transition-all cursor-pointer"
              >
                Sign out
              </button>
              <button
                onClick={() => {
                  setActivePortal('public');
                }}
                className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm font-medium rounded-lg border border-blue-500/30 transition-all cursor-pointer"
              >
                Switch account
              </button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-2xl font-bold text-white font-mono">7 Roles</div>
              <div className="text-slate-400">Strict RBAC &amp; Tenant Scope</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">100%</div>
              <div className="text-slate-400">Server-Side Quiz Grading</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">SHA-256</div>
              <div className="text-slate-400">Verifiable Credentials</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">Postgres</div>
              <div className="text-slate-400">Row-Level Security (RLS)</div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Courses Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Enterprise Curricula</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Certified Courses</h2>
          </div>
          <button
            onClick={onExploreCatalog}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Curricula</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                    {course.category}
                  </span>
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                    v{course.activeVersion}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs font-bold bg-white text-slate-900 px-2 py-1 rounded-md shadow">
                    {course.isFree ? 'Free' : `$${course.price}`}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{course.level}</span>
                    <span>•</span>
                    <span>{course.estimatedHours} hrs</span>
                    <span>•</span>
                    <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                      ★ {course.rating} ({course.reviewCount})
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                    {course.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={course.instructorAvatar}
                      alt={course.instructorName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-[11px] font-medium text-slate-700">{course.instructorName}</span>
                  </div>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    View Syllabus &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Architectural Pillars Section */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Enterprise Architecture</div>
          <h2 className="text-3xl font-extrabold text-slate-900">Built as a Coherent Modular System</h2>
          <p className="text-slate-600 text-sm">
            Maintaining strict separation between the learner experience, course governance studio, compliance audit trail, and institutional administration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. Learning Experience</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Rich course player supporting video lectures, markdown documentation, PDFs, and interactive lab checklists with idempotent progress tracking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">2. Governance Studio</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Curriculum authoring with draft revisions, version forking (v1.0 &rarr; v1.1), peer review feedback, and approval workflows preventing unauthorized self-publishing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3. Compliance &amp; Audit</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Append-only tamper-evident audit logs, account suspensions with recorded justification, session revoking, and SHA-256 certificate proofs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">4. Institutional Cohorts</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Multi-tenant B2B workspaces for corporate training: bulk CSV enrollment, cohort schedule windows, and organization-scoped progress analytics.
            </p>
          </div>

        </div>
      </section>

      {/* Role Tester Showcase Bar */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live RBAC Simulation</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Experience All 7 Roles Live in AI Studio</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            Click any persona below to instantaneously switch roles and experience real permission-enforced interfaces: review queues, course builder, grading studio, or admin audit center.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 max-w-lg">
          {allUsers.map(user => (
            <button
              key={user.id}
              onClick={() => switchUser(user.id)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
              <div className="text-left">
                <div className="font-semibold text-slate-100">{user.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};
