import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  UploadCloud, 
  Download, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Check, 
  AlertCircle,
  FileCode,
  ExternalLink,
  BookOpen,
  Terminal
} from 'lucide-react';
import { Course, Lesson, Module, Certificate } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

interface CoursePlayerProps {
  courseId: string;
  onBack: () => void;
  onViewCertificate: (cert: Certificate) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId, onBack, onViewCertificate }) => {
  const { 
    courses, 
    enrollments, 
    certificates,
    markLessonComplete, 
    submitQuizAttempt, 
    submitAssignment,
    submissions 
  } = useCourse();
  const { currentUser } = useAuth();

  const course = courses.find(c => c.id === courseId);
  if (!course) return null;

  const enrollment = enrollments.find(e => e.learnerId === currentUser.id && e.courseId === course.id);
  const activeVer = course.versions.find(v => v.version === course.activeVersion) || course.versions[0];

  // Flatten all lessons in order
  const allLessons: { lesson: Lesson; moduleTitle: string }[] = [];
  activeVer.modules.forEach(m => {
    m.lessons.forEach(l => {
      allLessons.push({ lesson: l, moduleTitle: m.title });
    });
  });

  const [currentLessonId, setCurrentLessonId] = useState<string>(
    allLessons[0]?.lesson.id || ''
  );

  const currentItem = allLessons.find(item => item.lesson.id === currentLessonId) || allLessons[0];
  const currentLesson = currentItem?.lesson;
  const currentIndex = allLessons.findIndex(item => item.lesson.id === currentLessonId);

  const isCompleted = enrollment?.completedLessonIds.includes(currentLesson?.id || '') || false;

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number; percentage: number } | null>(null);

  // Assignment state
  const [assignFile, setAssignFile] = useState<string>('architecture-audit-submission.pdf');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [submittedAssignment, setSubmittedAssignment] = useState<boolean>(false);

  // Practical task list local state
  const [practicalTasks, setPracticalTasks] = useState<{ id: string; description: string; completed: boolean }[]>(
    currentLesson?.content.practicalTasks || []
  );

  const existingSubmission = submissions.find(
    s => s.learnerId === currentUser.id && s.courseId === course.id && s.lessonId === currentLesson?.id
  );

  const [terminalCmd, setTerminalCmd] = useState('kubectl get pods -n security');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '$ calicoctl get networkpolicies -A',
    'NAMESPACE   NAME                AGE',
    'staging     default-deny-all    14m',
    'staging     allow-ingress-ui    8m',
    'staging     allow-egress-db     3m'
  ]);

  const handleRunTerminal = (overrideCmd?: string) => {
    const cmd = (overrideCmd || terminalCmd).trim();
    if (!cmd) return;

    let res = '';
    if (cmd.includes('kubectl') || cmd.includes('calico')) {
      res = '[OK] Policy applied: 4 cluster endpoints synchronized in 0.04s. Ingress on :443 enforced.';
    } else if (cmd.includes('spire') || cmd.includes('tls') || cmd.includes('openssl')) {
      res = '[OK] TLS 1.3 Handshake completed. Cipher: TLS_AES_256_GCM_SHA384. Mutual client cert validated.';
    } else {
      res = `[EXEC] Exit code 0 (success). Telemetry logged to Csbox runtime.`;
    }

    setTerminalLogs(prev => [...prev, `$ ${cmd}`, res]);
  };

  const handleTogglePracticalTask = (taskId: string) => {
    setPracticalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleCompleteAndNext = () => {
    if (currentLesson) {
      markLessonComplete(course.id, currentLesson.id);

      // Check if this action triggers 100% completion
      if (enrollment && enrollment.completedLessonIds.length + 1 >= allLessons.length) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].lesson.id);
      setQuizResult(null);
    }
  };

  const handlePreviousLesson = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].lesson.id);
      setQuizResult(null);
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson?.content.quiz) return;

    const result = submitQuizAttempt({
      quizId: currentLesson.content.quiz.id,
      courseId: course.id,
      learnerId: currentUser.id,
      learnerName: currentUser.name,
      attemptNumber: 1,
      startedAt: new Date().toISOString(),
      answers: selectedAnswers,
      score: 0,
      maxScore: 30,
      percentage: 0,
      passed: false
    });

    setQuizResult(result);

    if (result.passed) {
      markLessonComplete(course.id, currentLesson.id);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson?.content.assignment) return;

    submitAssignment({
      assignmentId: currentLesson.content.assignment.id,
      courseId: course.id,
      lessonId: currentLesson.id,
      learnerId: currentUser.id,
      learnerName: currentUser.name,
      learnerEmail: currentUser.email,
      fileUrl: `https://learnsphere.storage/uploads/${assignFile}`,
      fileName: assignFile,
      notes: assignNotes,
      maxScore: currentLesson.content.assignment.maxScore
    });

    setSubmittedAssignment(true);
    markLessonComplete(course.id, currentLesson.id);
  };

  const earnedCert = certificates.find(c => c.learnerId === currentUser.id && c.courseId === course.id);

  return (
    <div className="py-4 space-y-4 max-w-7xl mx-auto">
      
      {/* Top Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Return to Learner Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                Course Player • v{course.activeVersion}
              </span>
              {enrollment?.isCompleted && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Progress & Certificate Trigger */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">
              Progress: <span className="font-mono text-blue-600">{enrollment?.progressPercent || 0}%</span>
            </div>
            <div className="w-28 sm:w-36 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${enrollment?.progressPercent || 0}%` }}
              ></div>
            </div>
          </div>

          {earnedCert && (
            <button
              onClick={() => onViewCertificate(earnedCert)}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View Credential</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Lesson Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-2 p-3">
          <div className="px-2 py-2 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Syllabus Modules</span>
            <span className="font-mono font-normal text-slate-400">
              {enrollment?.completedLessonIds.length || 0}/{allLessons.length} Done
            </span>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {activeVer.modules.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-50 rounded-lg">
                  Module {modIdx + 1}: {mod.title}
                </div>

                <div className="space-y-0.5">
                  {mod.lessons.map(les => {
                    const active = les.id === currentLessonId;
                    const done = enrollment?.completedLessonIds.includes(les.id);

                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          setCurrentLessonId(les.id);
                          setQuizResult(null);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {done ? (
                            <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-white' : 'text-emerald-600'}`} />
                          ) : (
                            <div className={`w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 ${active ? 'border-white' : ''}`} />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                          {les.durationMinutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Stage Player Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {currentLesson && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              
              {/* Lesson Stage Top Bar */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                <div className="space-y-1">
                  <div className="text-[11px] text-blue-300 font-medium">
                    {currentItem.moduleTitle}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    {currentLesson.title}
                  </h2>
                </div>

                <span className="text-xs uppercase font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentLesson.type}
                </span>
              </div>

              {/* Lesson Dynamic Content */}
              <div className="p-6 sm:p-8 space-y-8">
                
                {/* 1. Video Player Component */}
                {currentLesson.type === 'video' && currentLesson.content.videoUrl && (
                  <div className="space-y-4">
                    <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative group">
                      <video
                        controls
                        className="w-full h-full object-cover"
                        poster={course.thumbnail}
                      >
                        <source src={currentLesson.content.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {currentLesson.content.textBody && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {currentLesson.content.textBody}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Structured Text & Code Component */}
                {currentLesson.type === 'text' && currentLesson.content.textBody && (
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap space-y-4">
                    {currentLesson.content.textBody}
                  </div>
                )}

                {/* 3. Practical Lab Activity Checklist */}
                {currentLesson.type === 'practical' && (
                  <div className="space-y-4">
                    {currentLesson.content.textBody && (
                      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 whitespace-pre-wrap leading-relaxed">
                        {currentLesson.content.textBody}
                      </div>
                    )}

                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Hands-On Milestone Checklist
                      </div>
                      <div className="space-y-2">
                        {practicalTasks.map(task => (
                          <label
                            key={task.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                              task.completed
                                ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleTogglePracticalTask(task.id)}
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className={task.completed ? 'line-through opacity-80' : 'font-medium'}>
                              {task.description}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Csbox Interactive Cloud Terminal Sandbox */}
                    <div className="bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-md space-y-0">
                      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold text-slate-200">Csbox Cloud Terminal Sandbox</span>
                          <span className="text-[10px] text-slate-500">• container-alpine-3.19</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                          Online
                        </span>
                      </div>

                      {/* Console Output Window */}
                      <div className="p-4 font-mono text-xs max-h-48 overflow-y-auto space-y-1 text-slate-300 bg-slate-950/90 leading-relaxed">
                        {terminalLogs.map((log, lIdx) => (
                          <div key={lIdx} className={log.startsWith('$') ? 'text-amber-300 font-semibold pt-1' : 'text-emerald-400'}>
                            {log}
                          </div>
                        ))}
                      </div>

                      {/* Command Line Input */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex items-center gap-2 flex-1 font-mono text-xs">
                          <span className="text-emerald-400 font-bold">$</span>
                          <input
                            type="text"
                            value={terminalCmd}
                            onChange={e => setTerminalCmd(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleRunTerminal();
                              }
                            }}
                            placeholder="Enter lab command (e.g. kubectl apply -f calico.yaml)..."
                            className="w-full bg-slate-950 text-white px-3 py-1.5 rounded-lg border border-slate-700 outline-none focus:border-emerald-500 font-mono text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRunTerminal()}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors"
                          >
                            Run
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const quickCmd = 'openssl s_client -connect csbox.internal:443 -tls1_3';
                              setTerminalCmd(quickCmd);
                              handleRunTerminal(quickCmd);
                            }}
                            className="text-[10px] text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
                          >
                            Quick mTLS check
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Interactive Quiz Engine */}
                {currentLesson.type === 'quiz' && currentLesson.content.quiz && (
                  <div className="space-y-6">
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                        <HelpCircle className="w-5 h-5 text-amber-600" />
                        <span>{currentLesson.content.quiz.title}</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        {currentLesson.content.quiz.description} Pass threshold:{' '}
                        <strong>{currentLesson.content.quiz.passThresholdPercent}%</strong>.
                      </p>
                    </div>

                    <form onSubmit={handleQuizSubmit} className="space-y-6">
                      {currentLesson.content.quiz.questions.map((q, qIndex) => (
                        <div key={q.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/40">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-xs text-slate-800">
                              Question {qIndex + 1} of {currentLesson.content.quiz?.questions.length}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">{q.points} Points</span>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-slate-900">{q.prompt}</p>

                          <div className="space-y-2 pt-2">
                            {q.options.map((opt, optIndex) => {
                              const isSelected = selectedAnswers[q.id] === optIndex;
                              return (
                                <label
                                  key={optIndex}
                                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium shadow-sm'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`quiz_${q.id}`}
                                    checked={isSelected}
                                    onChange={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Reveal explanation after submit */}
                          {quizResult && (
                            <div className="pt-2 text-[11px] bg-slate-100 p-2.5 rounded-lg text-slate-600">
                              <span className="font-bold text-slate-700">Explanation:</span> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}

                      {quizResult && (
                        <div
                          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
                            quizResult.passed
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-red-50 border-red-300 text-red-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {quizResult.passed ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                            <span>
                              {quizResult.passed ? 'Assessment Passed!' : 'Pass Threshold Not Met (Please Retry)'} • Final Score: {quizResult.percentage}% ({quizResult.score}/30)
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
                      >
                        Submit Answers for Server Evaluation
                      </button>
                    </form>
                  </div>
                )}

                {/* 5. Assignment Upload & Rubric Stage */}
                {currentLesson.type === 'assignment' && currentLesson.content.assignment && (
                  <div className="space-y-6">
                    <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-purple-900 text-sm">
                        <UploadCloud className="w-5 h-5 text-purple-600" />
                        <span>{currentLesson.content.assignment.title}</span>
                      </div>
                      <p className="text-xs text-purple-800 leading-relaxed">
                        {currentLesson.content.assignment.instructions}
                      </p>
                    </div>

                    {/* Rubric View */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Grading Rubric (Max Score: {currentLesson.content.assignment.maxScore})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {currentLesson.content.assignment.rubric.map((r, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-700">{r.criterion}</span>
                            <span className="font-mono font-bold text-blue-600">{r.maxScore} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submission Status or Upload Form */}
                    {existingSubmission || submittedAssignment ? (
                      <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-900">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Assignment Submission on Record</span>
                        </div>
                        <p className="text-emerald-800">
                          File: <span className="font-mono font-semibold">{existingSubmission?.fileName || assignFile}</span>
                        </p>
                        <p className="text-emerald-700 text-[11px]">
                          Status: {existingSubmission?.status === 'graded' ? `Graded: ${existingSubmission.score}/100` : 'Pending Instructor Evaluation'}
                        </p>
                        {existingSubmission?.feedback && (
                          <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-slate-800 mt-2">
                            <strong>Faculty Feedback:</strong> {existingSubmission.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700">Upload your PDF Report or Architecture Deck</div>
                          <div className="text-[11px] text-slate-500 font-mono">Simulated file: {assignFile}</div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Submission Notes for Instructor
                          </label>
                          <textarea
                            rows={3}
                            value={assignNotes}
                            onChange={e => setAssignNotes(e.target.value)}
                            placeholder="Provide any context, assumptions, or repository links..."
                            className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Submit Assignment to Faculty</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Downloadable Resources Box */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div className="border-t border-slate-200 pt-6 space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>Downloadable Lesson Materials &amp; Standards</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentLesson.resources.map(res => (
                        <div
                          key={res.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{res.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">{res.size || 'PDF'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Lesson Bottom Action Controls */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                
                <button
                  onClick={handlePreviousLesson}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Lesson</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCompleteAndNext}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {isCompleted ? 'Next Lesson' : 'Mark Lesson Complete & Next'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
