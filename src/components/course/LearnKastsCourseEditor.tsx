import React, { useState } from 'react';
import { 
  ChevronRight, 
  Eye, 
  MessageSquare, 
  Menu, 
  Plus, 
  Trash2, 
  Edit, 
  HelpCircle, 
  FileText, 
  PlayCircle, 
  UploadCloud, 
  CheckCircle2, 
  Send, 
  GitBranch, 
  X,
  FileCode,
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { Course, CourseVersion, Module, Lesson, LessonType, QuizQuestion } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

interface LearnKastsCourseEditorProps {
  courseId: string;
  onPreviewAsStudent: (courseId: string) => void;
  onNavigateBreadcrumb: (target: 'dashboard' | 'courses') => void;
}

export const LearnKastsCourseEditor: React.FC<LearnKastsCourseEditorProps> = ({
  courseId,
  onPreviewAsStudent,
  onNavigateBreadcrumb,
}) => {
  const { 
    courses, 
    updateCourseDraft, 
    createNewVersion, 
    addModuleToVersion, 
    addLessonToModule, 
    submitVersionForReview,
    addReviewComment,
    publishCourseVersion,
    unpublishCourse
  } = useCourse();
  const { currentUser } = useAuth();

  const course = courses.find(c => c.id === courseId) || courses[0];
  const [activeTab, setActiveTab] = useState<'curriculum' | 'settings'>('curriculum');

  // Active version state
  const [activeVersionNumber, setActiveVersionNumber] = useState<string>(course.activeVersion);
  const activeVersion = course.versions.find(v => v.version === activeVersionNumber) || course.versions[0];

  // Modals & Panels
  const [showAdminFeedback, setShowAdminFeedback] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSubmitReviewModal, setShowSubmitReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Module modal
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // Lesson modal
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('quiz');
  const [lessonDuration, setLessonDuration] = useState(15);
  const [quizQuestionText, setQuizQuestionText] = useState('Which architectural component evaluates policy in Zero Trust?');
  const [quizOpt0, setQuizOpt0] = useState('Policy Decision Point (PDP)');
  const [quizOpt1, setQuizOpt1] = useState('Policy Enforcement Point (PEP)');
  const [quizOpt2, setQuizOpt2] = useState('Traditional NAT Firewall');
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);

  // Edit Lesson / Quiz Modal
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson } | null>(null);

  // Settings form local state
  const [settingsTitle, setSettingsTitle] = useState(course.title);
  const [settingsSubtitle, setSettingsSubtitle] = useState(course.subtitle);
  const [settingsCategory, setSettingsCategory] = useState(course.category);
  const [settingsPrice, setSettingsPrice] = useState(course.price);
  const [settingsLevel, setSettingsLevel] = useState(course.level);
  const [settingsDescription, setSettingsDescription] = useState(course.description);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // New Version fork modal
  const [showForkModal, setShowForkModal] = useState(false);
  const [newVersionForkNum, setNewVersionForkNum] = useState('1.3');
  const [forkChangelog, setForkChangelog] = useState('');

  // Feedback note state
  const [reviewerComment, setReviewerComment] = useState('');

  const statusColors: Record<string, { dot: string; text: string; label: string }> = {
    draft: { dot: 'bg-amber-400', text: 'text-amber-800', label: 'Draft' },
    under_review: { dot: 'bg-blue-500', text: 'text-blue-800', label: 'Under Review' },
    revision_requested: { dot: 'bg-amber-500', text: 'text-amber-800', label: 'Revision Requested' },
    approved: { dot: 'bg-emerald-500', text: 'text-emerald-800', label: 'Approved' },
    published: { dot: 'bg-emerald-600', text: 'text-emerald-900', label: 'Published' },
    archived: { dot: 'bg-slate-400', text: 'text-slate-700', label: 'Archived' },
  };

  const status = statusColors[activeVersion.status] || statusColors.draft;

  // Handlers
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitVersionForReview(course.id, activeVersion.version, reviewNotes || 'Submitted for academic evaluation.');
    setShowSubmitReviewModal(false);
    setReviewNotes('');
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    addModuleToVersion(course.id, activeVersion.version, moduleTitle, moduleDesc || 'Module description.');
    setShowAddModuleModal(false);
    setModuleTitle('');
    setModuleDesc('');
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !targetModuleId) return;

    let lessonContent: Lesson['content'] = {};

    if (lessonType === 'quiz') {
      lessonContent = {
        quiz: {
          id: `qz_${Date.now()}`,
          title: lessonTitle,
          description: 'Module assessment to verify concept mastery.',
          timeLimitMinutes: 15,
          passThresholdPercent: 75,
          maxAttempts: 3,
          questions: [
            {
              id: `q_${Date.now()}`,
              prompt: quizQuestionText,
              options: [quizOpt0, quizOpt1, quizOpt2],
              correctOptionIndex: quizCorrectIndex,
              explanation: 'Server-side validated knowledge check criterion.',
              points: 10
            }
          ]
        }
      };
    } else {
      lessonContent = {
        textBody: 'Detailed lesson instructional material, references, and commands.'
      };
    }

    addLessonToModule(course.id, activeVersion.version, targetModuleId, {
      title: lessonTitle,
      type: lessonType,
      durationMinutes: lessonDuration,
      content: lessonContent
    });

    setShowAddLessonModal(false);
    setLessonTitle('');
  };

  const handleDeleteModule = (moduleId: string) => {
    const updatedModules = activeVersion.modules.filter(m => m.id !== moduleId);
    updateCourseDraft(course.id, activeVersion.version, { modules: updatedModules });
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    const updatedModules = activeVersion.modules.map(m => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: m.lessons.filter(l => l.id !== lessonId)
      };
    });
    updateCourseDraft(course.id, activeVersion.version, { modules: updatedModules });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Update local course details
    course.title = settingsTitle;
    course.subtitle = settingsSubtitle;
    course.category = settingsCategory;
    course.price = settingsPrice;
    course.level = settingsLevel;
    course.description = settingsDescription;

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleForkNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionForkNum.trim()) return;
    createNewVersion(course.id, activeVersion.version, newVersionForkNum, forkChangelog || 'Branched revision');
    setActiveVersionNumber(newVersionForkNum);
    setShowForkModal(false);
    setForkChangelog('');
  };

  const handlePostReviewComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerComment.trim()) return;
    addReviewComment(course.id, activeVersion.version, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      category: 'curriculum',
      comment: reviewerComment
    });
    setReviewerComment('');
  };

  return (
    <div className="py-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Top Breadcrumb Bar + Actions Header (Exact match to screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button
            onClick={() => onNavigateBreadcrumb('dashboard')}
            className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Dashboard
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => onNavigateBreadcrumb('courses')}
            className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Courses
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
            {course.title}
          </span>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          
          {/* Status Dot Pill */}
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${status.dot} animate-pulse`} />
            <span className={`text-sm font-semibold ${status.text}`}>
              {status.label}
            </span>

            {/* Version Branch badge */}
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-medium border border-slate-200 ml-1">
              v{activeVersion.version}
            </span>
          </div>

          {/* Action Buttons Row matching screenshot */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            
            {/* 1. Primary Action Button (Role-Aware) */}
            {currentUser.role === 'super_admin' ? (
              activeVersion.status === 'published' ? (
                <button
                  onClick={() => unpublishCourse(course.id, 'Super Admin emergency governance unpublish')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Unpublish Course
                </button>
              ) : (
                <button
                  onClick={() => publishCourseVersion(course.id, activeVersion.version)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Publish to Catalog
                </button>
              )
            ) : currentUser.role === 'admin' ? (
              activeVersion.status === 'under_review' ? (
                <button
                  disabled
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold shadow-xs cursor-default"
                >
                  Submitted for Review
                </button>
              ) : activeVersion.status === 'published' ? (
                <button
                  disabled
                  className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold shadow-xs cursor-default"
                >
                  Published Live
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitReviewModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Submit for Review
                </button>
              )
            ) : (
              <button
                onClick={() => onPreviewAsStudent(course.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Open Course Player
              </button>
            )}

            {/* 2. Admin Feedback button */}
            <button
              onClick={() => setShowAdminFeedback(!showAdminFeedback)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                showAdminFeedback
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>Admin Feedback</span>
              {(activeVersion.reviewFeedback?.length || 0) > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeVersion.reviewFeedback?.length}
                </span>
              )}
            </button>

            {/* 3. Preview as Student button */}
            <button
              onClick={() => onPreviewAsStudent(course.id)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200/90 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Preview as Student</span>
            </button>

            {/* 4. Quick Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200/90 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Menu className="w-3.5 h-3.5 text-slate-600" />
                <span>Quick Actions</span>
              </button>

              {showQuickActions && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
                  <button
                    onClick={() => {
                      setShowForkModal(true);
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4 text-blue-600" />
                    <span>Fork New Version</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-slate-500" />
                    <span>Edit Metadata &amp; Pricing</span>
                  </button>
                  <button
                    onClick={() => {
                      onPreviewAsStudent(course.id);
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>Open Interactive Player</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Tabs Row matching screenshot: "Curriculum" | "Settings" */}
      <div className="flex items-center gap-6 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
            activeTab === 'curriculum'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Curriculum</span>
          {activeTab === 'curriculum' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
            activeTab === 'settings'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Settings</span>
          {activeTab === 'settings' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Admin Feedback Drawer (when opened) */}
      {showAdminFeedback && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Admin &amp; Academic QA Feedback Thread</span>
            </div>
            <button
              onClick={() => setShowAdminFeedback(false)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activeVersion.reviewFeedback && activeVersion.reviewFeedback.length > 0 ? (
              activeVersion.reviewFeedback.map(fb => (
                <div key={fb.id} className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-bold text-slate-800">{fb.authorName} ({fb.authorRole})</span>
                    <span className="font-mono text-[10px] uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      {fb.category}
                    </span>
                  </div>
                  <p className="text-slate-700">{fb.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-amber-800 italic">No formal QA comments recorded on this version yet.</p>
            )}
          </div>

          <form onSubmit={handlePostReviewComment} className="flex gap-2 pt-1">
            <input
              type="text"
              value={reviewerComment}
              onChange={e => setReviewerComment(e.target.value)}
              placeholder="Leave an academic review note or instructor response..."
              className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded-xl"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Post Note
            </button>
          </form>
        </div>
      )}

      {/* CURRICULUM TAB (Exact match to screenshot) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          
          {/* Section Header: Course Curriculum + Add Module button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Course Curriculum
            </h2>

            <button
              onClick={() => setShowAddModuleModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>

          {/* Module Cards */}
          <div className="space-y-6">
            {activeVersion.modules.map((mod, modIdx) => (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Module Header Row */}
                <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 border-b border-slate-100">
                  
                  {/* Left: Drag handle + Module # + Title + Lesson Count */}
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 font-mono text-lg font-bold select-none cursor-grab mt-0.5">
                      =
                    </span>
                    <div>
                      <div className="text-xs font-medium text-slate-400">
                        Module {modIdx + 1}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {mod.title}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Edit & Delete buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setTargetModuleId(mod.id);
                        setShowAddLessonModal(true);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      + Add Lesson
                    </button>
                    <button
                      onClick={() => {
                        const newName = prompt('Edit Module Title:', mod.title);
                        if (newName && newName.trim()) {
                          const updated = activeVersion.modules.map(m => m.id === mod.id ? { ...m, title: newName } : m);
                          updateCourseDraft(course.id, activeVersion.version, { modules: updated });
                        }
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors"
                      title="Delete module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Lessons List Rows (matching screenshot) */}
                <div className="divide-y divide-slate-100">
                  {mod.lessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Left: Drag handle + Soft purple icon + Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-slate-300 font-mono text-base font-bold select-none cursor-grab">
                          =
                        </span>
                        
                        {/* Rounded purple icon matching screenshot */}
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/40">
                          {lesson.type === 'quiz' ? (
                            <HelpCircle className="w-4 h-4" />
                          ) : lesson.type === 'video' ? (
                            <PlayCircle className="w-4 h-4 text-blue-600" />
                          ) : lesson.type === 'assignment' ? (
                            <UploadCloud className="w-4 h-4 text-purple-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>

                        <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                          {lesson.title}
                        </span>
                      </div>

                      {/* Right: Soft purple "Quiz" tag + Edit Quiz button + Trash icon */}
                      <div className="flex items-center gap-3 shrink-0">
                        
                        {/* Soft Tag Pill */}
                        <span className="text-[11px] font-semibold capitalize bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-md border border-purple-200/40">
                          {lesson.type}
                        </span>

                        {/* Edit Action Button */}
                        <button
                          onClick={() => setEditingLesson({ moduleId: mod.id, lesson })}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-slate-100"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit {lesson.type === 'quiz' ? 'Quiz' : 'Lesson'}</span>
                        </button>

                        {/* Delete Red Trash icon */}
                        <button
                          onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors"
                          title="Delete lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </div>
                  ))}

                  {mod.lessons.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No lessons added to this module yet. Click "+ Add Lesson" above.
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Curriculum Metadata &amp; Pricing</h3>
            <p className="text-xs text-slate-500">Update catalog visibility, category, and accreditation rules.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Title</label>
              <input
                type="text"
                required
                value={settingsTitle}
                onChange={e => setSettingsTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={settingsCategory}
                onChange={e => setSettingsCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Price ($ USD)</label>
              <input
                type="number"
                value={settingsPrice}
                onChange={e => setSettingsPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Difficulty Level</label>
              <select
                value={settingsLevel}
                onChange={e => setSettingsLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Subtitle</label>
            <input
              type="text"
              value={settingsSubtitle}
              onChange={e => setSettingsSubtitle(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
            <textarea
              rows={4}
              value={settingsDescription}
              onChange={e => setSettingsDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {settingsSaved ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Changes Saved!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Course Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL: Submit for Review */}
      {showSubmitReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Submit Curriculum for QA Review</h3>
            <p className="text-xs text-slate-500">
              The Academic Review Board will inspect your learning objectives, quiz answer keys, and grading rubrics.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Submission Notes</label>
                <textarea
                  rows={3}
                  required
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Summarize curriculum additions, assessments, and readiness..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitReviewModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Module */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add New Module</h3>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={e => setModuleTitle(e.target.value)}
                  placeholder="e.g. Getting Started or Core Architecture"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={moduleDesc}
                  onChange={e => setModuleDesc(e.target.value)}
                  placeholder="Brief summary of module objectives..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Lesson */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Add New Lesson</h3>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={e => setLessonTitle(e.target.value)}
                  placeholder="e.g. Module 1 Knowledge Check"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={lessonType}
                    onChange={e => setLessonType(e.target.value as LessonType)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="video">Video</option>
                    <option value="text">Structured Text</option>
                    <option value="assignment">Assignment</option>
                    <option value="practical">Practical Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={lessonDuration}
                    onChange={e => setLessonDuration(Number(e.target.value))}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {lessonType === 'quiz' && (
                <div className="space-y-3 bg-purple-50/50 p-3.5 rounded-xl border border-purple-200/50 text-xs">
                  <div className="font-bold text-purple-900">Initial Quiz Question</div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Question Prompt</label>
                    <input
                      type="text"
                      value={quizQuestionText}
                      onChange={e => setQuizQuestionText(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 font-medium">Options</label>
                    <input
                      type="text"
                      value={quizOpt0}
                      onChange={e => setQuizOpt0(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      placeholder="Option 1 (Correct)"
                    />
                    <input
                      type="text"
                      value={quizOpt1}
                      onChange={e => setQuizOpt1(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      placeholder="Option 2"
                    />
                    <input
                      type="text"
                      value={quizOpt2}
                      onChange={e => setQuizOpt2(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      placeholder="Option 3"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Fork New Version */}
      {showForkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Fork New Version Branch</h3>
            <p className="text-xs text-slate-500">
              Clones curriculum for safe revision without disrupting published student enrollments.
            </p>

            <form onSubmit={handleForkNewVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Version Number</label>
                <input
                  type="text"
                  required
                  value={newVersionForkNum}
                  onChange={e => setNewVersionForkNum(e.target.value)}
                  placeholder="e.g. 1.3 or 2.0"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Changelog Summary</label>
                <textarea
                  rows={3}
                  value={forkChangelog}
                  onChange={e => setForkChangelog(e.target.value)}
                  placeholder="e.g. Revamped Module 1 with interactive knowledge check quizzes..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForkModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Lesson Details */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Edit {editingLesson.lesson.title}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingLesson.lesson.title}
                  onChange={e => {
                    const newTitle = e.target.value;
                    setEditingLesson(prev => prev ? {
                      ...prev,
                      lesson: { ...prev.lesson, title: newTitle }
                    } : null);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={editingLesson.lesson.durationMinutes}
                  onChange={e => {
                    const dur = Number(e.target.value);
                    setEditingLesson(prev => prev ? {
                      ...prev,
                      lesson: { ...prev.lesson, durationMinutes: dur }
                    } : null);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (editingLesson) {
                    const updatedModules = activeVersion.modules.map(m => {
                      if (m.id !== editingLesson.moduleId) return m;
                      return {
                        ...m,
                        lessons: m.lessons.map(l => l.id === editingLesson.lesson.id ? editingLesson.lesson : l)
                      };
                    });
                    updateCourseDraft(course.id, activeVersion.version, { modules: updatedModules });
                  }
                  setEditingLesson(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
