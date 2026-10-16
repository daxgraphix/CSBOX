import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  FileText, 
  UploadCloud, 
  Award, 
  Check, 
  User, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { AssignmentSubmission } from '../../types';
import { useCourse } from '../../context/CourseContext';

interface GradingStudioProps {
  onBack: () => void;
}

export const GradingStudio: React.FC<GradingStudioProps> = ({ onBack }) => {
  const { submissions, gradeAssignment } = useCourse();
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);

  // Grading form state
  const [rubricScore1, setRubricScore1] = useState<number>(28);
  const [rubricScore2, setRubricScore2] = useState<number>(32);
  const [rubricScore3, setRubricScore3] = useState<number>(18);
  const [rubricScore4, setRubricScore4] = useState<number>(14);
  const [feedbackText, setFeedbackText] = useState<string>('Rigorous threat modeling and clear mTLS implementation roadmap. Excellent work on the Calico network policy ingress rules.');

  const totalCalculated = rubricScore1 + rubricScore2 + rubricScore3 + rubricScore4;

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    gradeAssignment(selectedSub.id, totalCalculated, feedbackText, {
      threat_modeling: rubricScore1,
      control_plane: rubricScore2,
      mtls_lifecycle: rubricScore3,
      compliance: rubricScore4
    });

    setSelectedSub(null);
  };

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Instructor Studio</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Assignment Grading Queue</h1>
          <p className="text-xs text-slate-500">
            Review learner capstones, evaluate against published rubrics, and release official scores.
          </p>
        </div>
        <span className="text-xs font-mono bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold border border-purple-200">
          {submissions.filter(s => s.status === 'pending').length} Pending Submissions
        </span>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Learner Profile</th>
              <th className="px-5 py-3.5">Assignment File</th>
              <th className="px-5 py-3.5">Submitted Date</th>
              <th className="px-5 py-3.5">Status / Score</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-900">{sub.learnerName}</div>
                  <div className="text-[11px] text-slate-400">{sub.learnerEmail}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-mono text-slate-700 font-medium truncate max-w-[200px]">
                      {sub.fileName}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-slate-500 text-[11px]">
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  {sub.status === 'graded' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Graded: {sub.score}/{sub.maxScore}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Pending Grading
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => setSelectedSub(sub)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                  >
                    {sub.status === 'graded' ? 'Review / Regrade' : 'Grade Submission'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grading Evaluation Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 border border-slate-200 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Grade Capstone: {selectedSub.learnerName}
                </h3>
                <p className="text-xs text-slate-500">
                  File: <span className="font-mono font-semibold text-slate-700">{selectedSub.fileName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {selectedSub.notes && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-700">Learner's Submission Notes:</div>
                <div className="text-slate-600">{selectedSub.notes}</div>
              </div>
            )}

            {/* Rubric Criteria Evaluation */}
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rubric Scoring Criteria
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">1. Threat Modeling &amp; Attack Surface Identification</div>
                    <div className="text-[10px] text-slate-500">Max: 30 points</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={rubricScore1}
                    onChange={e => setRubricScore1(Number(e.target.value))}
                    className="w-16 p-1.5 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">2. Zero Trust Control Plane &amp; PDP/PEP Architecture</div>
                    <div className="text-[10px] text-slate-500">Max: 35 points</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={35}
                    value={rubricScore2}
                    onChange={e => setRubricScore2(Number(e.target.value))}
                    className="w-16 p-1.5 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">3. mTLS &amp; Certificate Lifecycle Automation Plan</div>
                    <div className="text-[10px] text-slate-500">Max: 20 points</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={rubricScore3}
                    onChange={e => setRubricScore3(Number(e.target.value))}
                    className="w-16 p-1.5 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">4. Regulatory Compliance Matrix (NIST / ISO 27001)</div>
                    <div className="text-[10px] text-slate-500">Max: 15 points</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={rubricScore4}
                    onChange={e => setRubricScore4(Number(e.target.value))}
                    className="w-16 p-1.5 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-900">Total Calculated Grade:</span>
                <span className="font-mono text-base font-extrabold text-blue-700">
                  {totalCalculated} / 100
                </span>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qualitative Faculty Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-md"
                >
                  Confirm &amp; Release Grade
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
