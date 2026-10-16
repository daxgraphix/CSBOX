import React from 'react';
import { HelpCircle, CheckCircle, Clock, FileText, AlertCircle, Award } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

interface StudentAssessmentsViewProps {
  onOpenCoursePlayer: (courseId: string) => void;
}

export const StudentAssessmentsView: React.FC<StudentAssessmentsViewProps> = ({ onOpenCoursePlayer }) => {
  const { quizAttempts, submissions, courses } = useCourse();
  const { currentUser } = useAuth();

  const myAttempts = quizAttempts.filter(a => a.learnerId === currentUser.id);
  const mySubmissions = submissions.filter(s => s.learnerId === currentUser.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">My Quizzes &amp; Assignment Evaluations</h1>
        <p className="text-xs text-slate-500">
          Track your quiz attempts, server-verified scoring, and faculty rubric feedback.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Quizzes Completed</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{myAttempts.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">All attempts verified server-side</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Assignments Submitted</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{mySubmissions.length}</div>
          <div className="text-[11px] text-slate-400">
            {mySubmissions.filter(s => s.status === 'graded').length} Graded by Faculty
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Average Quiz Score</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {myAttempts.length > 0 
              ? Math.round(myAttempts.reduce((acc, a) => acc + a.percentage, 0) / myAttempts.length)
              : 100}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Passing threshold: 70%</div>
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Quiz Attempt History</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{myAttempts.length} records</span>
        </div>

        {myAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No quiz attempts recorded yet. Launch a course from your learning player to take interactive knowledge checks!
          </div>
        ) : (
          <div className="space-y-3">
            {myAttempts.map(att => {
              const crs = courses.find(c => c.id === att.courseId);
              return (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {crs ? crs.title : 'Knowledge Check Quiz'}
                    </div>
                    <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                      <span>Attempt #{att.attemptNumber}</span>
                      <span>•</span>
                      <span>{new Date(att.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-lg ${
                      att.passed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {att.passed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                      <span>Score: {att.percentage}% ({att.score}/{att.maxScore} pts)</span>
                    </span>

                    <button
                      onClick={() => onOpenCoursePlayer(att.courseId)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-600 font-semibold border border-slate-200 rounded-lg cursor-pointer"
                    >
                      Review in Player
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignment Submissions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Capstone &amp; Practical Assignment Submissions</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{mySubmissions.length} submissions</span>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No capstone assignments submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {mySubmissions.map(sub => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {sub.fileName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sub.status === 'graded' ? `Graded: ${sub.score}/${sub.maxScore}` : 'Pending Faculty Evaluation'}
                  </span>
                </div>

                {sub.feedback && (
                  <div className="p-3 bg-white rounded-lg border border-purple-200 text-purple-950 text-xs">
                    <strong className="text-purple-900">Faculty Rubric Feedback:</strong> {sub.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
