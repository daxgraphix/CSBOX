import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  UploadCloud, 
  Lock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Course, Module, Lesson } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
  onStartLearning: (courseId: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack, onStartLearning }) => {
  const { courses, enrollments, enrollInCourse } = useCourse();
  const { currentUser } = useAuth();

  const course = courses.find(c => c.id === courseId);
  if (!course) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500">Course not found.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 font-semibold cursor-pointer">
          &larr; Back to Catalog
        </button>
      </div>
    );
  }

  const enrollment = enrollments.find(e => e.learnerId === currentUser.id && e.courseId === course.id);
  const activeVer = course.versions.find(v => v.version === course.activeVersion) || course.versions[0];

  const handleEnrollClick = () => {
    if (!enrollment) {
      enrollInCourse(course.id);
    }
    onStartLearning(course.id);
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'text': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'assignment': return <UploadCloud className="w-4 h-4 text-purple-500" />;
      case 'practical': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <BookOpen className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Catalog</span>
      </button>

      {/* Hero Header */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
              {course.category}
            </span>
            <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono text-[11px] border border-slate-700">
              Active Version {course.activeVersion}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{course.level} Level</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{course.estimatedHours} Total Hours</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {course.subtitle}
          </p>

          <div className="flex items-center gap-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <img
                src={course.instructorAvatar}
                alt={course.instructorName}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
              <div>
                <div className="text-white font-semibold">{course.instructorName}</div>
                <div className="text-[10px] text-slate-400">Instructor &amp; Subject Lead</div>
              </div>
            </div>

            <div className="border-l border-slate-800 pl-4">
              <div className="text-amber-400 font-bold text-sm">★ {course.rating}</div>
              <div className="text-[10px] text-slate-400">{course.reviewCount} Academic Reviews</div>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {course.isFree ? 'Free' : `$${course.price}`}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Verifiable Certificate Included
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Full lifetime access to version {course.activeVersion}, hands-on labs, interactive quizzes, instructor rubrics, and accredited credentials.
            </p>

            {enrollment && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span>Enrolled Status</span>
                  <span>{enrollment.progressPercent}% Completed</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${enrollment.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleEnrollClick}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            {enrollment ? (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Resume Learning</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enroll Now ({course.isFree ? 'Free' : `$${course.price}`})</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Main Grid: Objectives & Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Learning Objectives & Description */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Objectives */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>What You Will Master</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              {course.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Curriculum Description</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Syllabus Modules */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Curriculum Syllabus</h2>
                <p className="text-xs text-slate-500">
                  {activeVer.modules.length} modules • {activeVer.modules.reduce((acc, m) => acc + m.lessons.length, 0)} total lessons
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                Ver {activeVer.version}
              </span>
            </div>

            <div className="space-y-4">
              {activeVer.modules.map((mod, modIdx) => (
                <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200 text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                        {modIdx + 1}
                      </span>
                      <span>{mod.title}</span>
                    </span>
                    <span className="text-slate-500 font-normal">{mod.lessons.length} lessons</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {mod.lessons.map(les => (
                      <div key={les.id} className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-700 hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-center gap-2.5">
                          {getLessonIcon(les.type)}
                          <span className="font-medium">{les.title}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                            {les.type}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono">{les.durationMinutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Instructor & Prerequisites */}
        <div className="space-y-6">
          
          {/* Instructor Bio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Instructor</h3>
            <div className="flex items-center gap-3">
              <img
                src={course.instructorAvatar}
                alt={course.instructorName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{course.instructorName}</h4>
                <p className="text-xs text-blue-600 font-medium">Faculty Member</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {course.instructorBio}
            </p>
          </div>

          {/* Prerequisites */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prerequisites</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {course.prerequisites.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">&bull;</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Certification Verification Guarantee */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-2xl border border-amber-200 space-y-3 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Verifiable Credential Guarantee</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              Upon satisfying all course modules and scoring &ge; 70% on continuous evaluations, you receive an authorized, tamper-proof certificate with SHA-256 cryptographic verification.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
