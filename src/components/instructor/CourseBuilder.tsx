import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  GitBranch, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Layers, 
  FileText, 
  PlayCircle, 
  HelpCircle, 
  UploadCloud,
  Check,
  Edit2
} from 'lucide-react';
import { Course, CourseVersion, Module, Lesson, LessonType } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

interface CourseBuilderProps {
  courseId: string;
  onBack: () => void;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({ courseId, onBack }) => {
  const { 
    courses, 
    updateCourseDraft, 
    createNewVersion, 
    addModuleToVersion, 
    addLessonToModule, 
    submitVersionForReview 
  } = useCourse();
  const { currentUser } = useAuth();

  const course = courses.find(c => c.id === courseId);
  if (!course) return null;

  const [selectedVerNum, setSelectedVerNum] = useState<string>(course.activeVersion);
  const activeVersion = course.versions.find(v => v.version === selectedVerNum) || course.versions[0];

  // Modals state
  const [showForkModal, setShowForkModal] = useState(false);
  const [forkNewVersionNum, setForkNewVersionNum] = useState('1.3');
  const [forkChangelog, setForkChangelog] = useState('');

  const [showSubmitReviewModal, setShowSubmitReviewModal] = useState(false);
  const [reviewChangelog, setReviewChangelog] = useState('');

  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModTitle, setNewModTitle] = useState('');
  const [newModDesc, setNewModDesc] = useState('');

  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<LessonType>('text');
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newLessonBody, setNewLessonBody] = useState('');

  const handleForkVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forkNewVersionNum.trim()) return;
    createNewVersion(course.id, selectedVerNum, forkNewVersionNum, forkChangelog || 'New draft revision');
    setSelectedVerNum(forkNewVersionNum);
    setShowForkModal(false);
    setForkChangelog('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitVersionForReview(course.id, activeVersion.version, reviewChangelog || 'Submitted for accreditation review');
    setShowSubmitReviewModal(false);
    setReviewChangelog('');
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModTitle.trim()) return;
    addModuleToVersion(course.id, activeVersion.version, newModTitle, newModDesc);
    setShowAddModuleModal(false);
    setNewModTitle('');
    setNewModDesc('');
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !targetModuleId) return;

    addLessonToModule(course.id, activeVersion.version, targetModuleId, {
      title: newLessonTitle,
      type: newLessonType,
      durationMinutes: newLessonDuration,
      content: {
        textBody: newLessonBody || 'Lesson instructional content.'
      }
    });

    setShowAddLessonModal(false);
    setNewLessonTitle('');
    setNewLessonBody('');
  };

  const isEditable = activeVersion.status === 'draft' || activeVersion.status === 'revision_requested';

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Instructor Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Version Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Viewing Version:</span>
            <select
              value={selectedVerNum}
              onChange={e => setSelectedVerNum(e.target.value)}
              className="p-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 cursor-pointer"
            >
              {course.versions.map(v => (
                <option key={v.version} value={v.version}>
                  v{v.version} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowForkModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Fork New Version</span>
          </button>

          {isEditable && (
            <button
              onClick={() => setShowSubmitReviewModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for QA Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Version Status Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-blue-600 px-2 py-0.5 rounded text-white">
              Version {activeVersion.version}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
              activeVersion.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              activeVersion.status === 'under_review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {activeVersion.status.replace('_', ' ')}
            </span>
          </div>
          <h2 className="text-xl font-bold">{course.title}</h2>
          <p className="text-xs text-slate-400">
            {activeVersion.changelog || 'No revision changelog notes.'}
          </p>
        </div>

        {activeVersion.status === 'under_review' && (
          <div className="bg-amber-950/50 border border-amber-700/50 p-3 rounded-xl text-amber-200 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Under Review by Academic QA Board (Locked for editing)</span>
          </div>
        )}
      </div>

      {/* Review Feedback Thread (if any) */}
      {activeVersion.reviewFeedback && activeVersion.reviewFeedback.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Academic Reviewer Feedback Notes ({activeVersion.reviewFeedback.length})</span>
          </div>
          <div className="space-y-2">
            {activeVersion.reviewFeedback.map(fb => (
              <div key={fb.id} className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-semibold text-slate-800">{fb.authorName} ({fb.authorRole})</span>
                  <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-slate-700">{fb.comment}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules & Curriculum Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Curriculum Modules &amp; Lessons</h3>
          {isEditable && (
            <button
              onClick={() => setShowAddModuleModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {activeVersion.modules.map((mod, modIdx) => (
            <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      {modIdx + 1}
                    </span>
                    <span>{mod.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{mod.description}</div>
                </div>

                {isEditable && (
                  <button
                    onClick={() => {
                      setTargetModuleId(mod.id);
                      setShowAddLessonModal(true);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-600 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Lesson</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {mod.lessons.map(les => (
                  <div key={les.id} className="px-5 py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {les.type === 'video' ? <PlayCircle className="w-4 h-4 text-blue-500" /> :
                       les.type === 'quiz' ? <HelpCircle className="w-4 h-4 text-amber-500" /> :
                       les.type === 'assignment' ? <UploadCloud className="w-4 h-4 text-purple-500" /> :
                       <FileText className="w-4 h-4 text-indigo-500" />}
                      <div>
                        <div className="font-semibold text-slate-800">{les.title}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{les.type} lesson</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-slate-500 text-[11px]">
                      <span>{les.durationMinutes} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fork Version Modal */}
      {showForkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Fork New Course Version</h3>
            <p className="text-xs text-slate-500">
              Preserves the existing published version untouched while cloning curriculum for revision.
            </p>

            <form onSubmit={handleForkVersion} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Version Number</label>
                <input
                  type="text"
                  required
                  value={forkNewVersionNum}
                  onChange={e => setForkNewVersionNum(e.target.value)}
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
                  placeholder="Describe planned curriculum changes, updated standards, or new labs..."
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Version Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit for Review Modal */}
      {showSubmitReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Submit Version for Academic QA</h3>
            <p className="text-xs text-slate-500">
              The Academic Reviewer board will verify learning outcomes, accessibility, and assessment thresholds before publication.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Submission Notes &amp; Highlights</label>
                <textarea
                  rows={3}
                  required
                  value={reviewChangelog}
                  onChange={e => setReviewChangelog(e.target.value)}
                  placeholder="Summarize key learning milestones, question items, and rubric updates..."
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Submit to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Module</h3>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={newModTitle}
                  onChange={e => setNewModTitle(e.target.value)}
                  placeholder="e.g. Identity Federation & SAML/OIDC Tokens"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newModDesc}
                  onChange={e => setNewModDesc(e.target.value)}
                  placeholder="Briefly describe module scope..."
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

      {/* Add Lesson Modal */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add New Lesson</h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={e => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Setting up SPIRE Server & Agent Attestation"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Type</label>
                  <select
                    value={newLessonType}
                    onChange={e => setNewLessonType(e.target.value as LessonType)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="text">Structured Text &amp; Code</option>
                    <option value="video">Video Lecture</option>
                    <option value="practical">Practical Task Lab</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="assignment">Assignment Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newLessonDuration}
                    onChange={e => setNewLessonDuration(Number(e.target.value))}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructional Body Content</label>
                <textarea
                  rows={4}
                  value={newLessonBody}
                  onChange={e => setNewLessonBody(e.target.value)}
                  placeholder="Enter markdown text, code blocks, or initial instructions..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2">
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

    </div>
  );
};
