import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  MessageSquare, 
  GitBranch, 
  ExternalLink,
  Send,
  XCircle,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Course, CourseVersion } from '../../types';

export const ReviewerDashboard: React.FC = () => {
  const { 
    courses, 
    recordReviewDecision, 
    addReviewComment, 
    publishCourseVersion 
  } = useCourse();
  const { currentUser } = useAuth();

  // Find all course versions that are under review or revision requested
  const reviewItems: { course: Course; version: CourseVersion }[] = [];
  courses.forEach(c => {
    c.versions.forEach(v => {
      if (v.status === 'under_review' || v.status === 'approved' || v.status === 'revision_requested') {
        reviewItems.push({ course: c, version: v });
      }
    });
  });

  const [selectedItem, setSelectedItem] = useState<{ course: Course; version: CourseVersion } | null>(
    reviewItems[0] || null
  );

  // Review statistics
  const reviewStats = {
    total: reviewItems.length,
    underReview: reviewItems.filter(i => i.version.status === 'under_review').length,
    approved: reviewItems.filter(i => i.version.status === 'approved').length,
    revisionRequested: reviewItems.filter(i => i.version.status === 'revision_requested').length,
  };

  // Review checklist
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(false);
  const [check4, setCheck4] = useState(true);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentCategory, setCommentCategory] = useState<'curriculum' | 'accessibility' | 'assessment' | 'general'>('curriculum');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedItem) return;

    addReviewComment(selectedItem.course.id, selectedItem.version.version, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: 'Academic Reviewer',
      category: commentCategory,
      comment: newComment
    });

    setNewComment('');
  };

  const handleApprove = () => {
    if (!selectedItem) return;
    recordReviewDecision(selectedItem.course.id, selectedItem.version.version, 'approved', 'All QA criteria satisfied.');
  };

  const handleRequestRevision = () => {
    if (!selectedItem) return;
    recordReviewDecision(selectedItem.course.id, selectedItem.version.version, 'revision_requested', 'Curriculum requires additional accessibility and rubric adjustments.');
  };

  const handlePublishNow = () => {
    if (!selectedItem) return;
    publishCourseVersion(selectedItem.course.id, selectedItem.version.version);
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Academic Governance &amp; Quality Assurance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curriculum Reviewer Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enforce academic rigor, accessibility compliance, and assessment validity prior to catalog publication.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-center">
          <div className="text-xl font-mono font-bold text-amber-400">{reviewItems.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">In QA Pipeline</div>
        </div>
      </div>

      {/* Review Statistics KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Under Review</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{reviewStats.underReview}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Approved</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{reviewStats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Revision Requested</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{reviewStats.revisionRequested}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-slate-600" />
            <span>Total Queue</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{reviewStats.total}</div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Submissions Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-2 p-3">
          <div className="px-3 py-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pending Submissions ({reviewItems.length})
          </div>

          <div className="space-y-2">
            {reviewItems.map(item => {
              const isSelected = selectedItem?.course.id === item.course.id && selectedItem?.version.version === item.version.version;
              return (
                <div
                  key={`${item.course.id}_${item.version.version}`}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      v{item.version.version}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                      item.version.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      item.version.status === 'revision_requested' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.version.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">
                    {item.course.title}
                  </h4>
                  
                  <div className="text-[11px] text-slate-500 mt-1">
                    Author: <span className="font-medium text-slate-700">{item.course.instructorName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Stage: Detailed QA Inspection */}
        {selectedItem && (
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {selectedItem.course.category} • Revision v{selectedItem.version.version}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedItem.course.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItem.version.status === 'under_review' && (
                    <>
                      <button
                        onClick={handleRequestRevision}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Revision</span>
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Approve Course</span>
                      </button>
                    </>
                  )}

                  {selectedItem.version.status === 'approved' && (
                    <button
                      onClick={handlePublishNow}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Release to Live Catalog</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Version Changelog */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Instructor Submission Changelog &amp; Notes
                </div>
                <div className="text-slate-800 font-medium">
                  {selectedItem.version.changelog || 'Initial curriculum submission.'}
                </div>
              </div>

              {/* Academic Quality Assurance Checklist */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Accreditation &amp; Governance Quality Checklist
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check1}
                      onChange={() => setCheck1(!check1)}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <strong className="text-slate-900">Curriculum Rigor &amp; Objectives Alignment:</strong>
                      <span className="text-slate-600 ml-1">Learning goals are clearly defined, progressive, and measurable.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check2}
                      onChange={() => setCheck2(!check2)}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <strong className="text-slate-900">Assessment Integrity &amp; Scoring Threshold:</strong>
                      <span className="text-slate-600 ml-1">Quiz answer keys validated server-side; assignment rubric clearly specified.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check3}
                      onChange={() => setCheck3(!check3)}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <strong className="text-slate-900">Accessibility &amp; Inclusion (WCAG 2.1 AA):</strong>
                      <span className="text-slate-600 ml-1">Lecture transcripts and downloadable reference PDFs are attached.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check4}
                      onChange={() => setCheck4(!check4)}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <strong className="text-slate-900">No Self-Publication Violation:</strong>
                      <span className="text-slate-600 ml-1">Reviewer is independent of the primary course author.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Reviewer Comments & Feedback Thread */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Review Comments Thread</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedItem.version.reviewFeedback?.length || 0} Recorded
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedItem.version.reviewFeedback?.map(fb => (
                    <div key={fb.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-bold text-slate-800">{fb.authorName} ({fb.authorRole})</span>
                        <span className="font-mono uppercase bg-slate-200 px-1.5 py-0.2 rounded text-[10px]">
                          {fb.category}
                        </span>
                      </div>
                      <p className="text-slate-700">{fb.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Add Feedback Form */}
                <form onSubmit={handlePostComment} className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700">Category:</label>
                    <select
                      value={commentCategory}
                      onChange={e => setCommentCategory(e.target.value as any)}
                      className="p-1 text-xs bg-slate-50 border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="curriculum">Curriculum</option>
                      <option value="accessibility">Accessibility</option>
                      <option value="assessment">Assessment</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    required
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Enter academic review comment, revision recommendation, or approval remarks..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Review Note</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
