import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play, 
  FileText, 
  HelpCircle, 
  Terminal, 
  Award, 
  ArrowRight, 
  Check, 
  Plus, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Database,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import { useAudit } from '../../context/AuditContext';

interface RoleTasksViewProps {
  onNavigate: (key: string, param?: string) => void;
}

interface TaskItem {
  id: string;
  title: string;
  category: 'lab' | 'quiz' | 'assignment' | 'review' | 'governance' | 'grading' | 'support' | 'personal';
  courseTitle?: string;
  courseId?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  actionLabel: string;
  actionTarget: string;
  actionParam?: string;
}

export const RoleTasksView: React.FC<RoleTasksViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { courses, submissions, certificates } = useCourse();
  const { logEvent } = useAudit();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  const [newPersonalTask, setNewPersonalTask] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Initial task sets based strictly on role
  const getInitialTasks = (): TaskItem[] => {
    if (currentUser.role === 'student') {
      return [
        {
          id: 'tsk_st_1',
          title: 'Hands-on Lab: Deploy Zero-Trust Calico Ingress & Egress Rules',
          category: 'lab',
          courseTitle: 'Network Security & Zero Trust Architecture',
          courseId: 'crs_sec_01',
          dueDate: 'Tomorrow, 23:59',
          priority: 'high',
          completed: false,
          actionLabel: 'Launch Lab in Sandbox',
          actionTarget: 'courses',
          actionParam: 'crs_sec_01'
        },
        {
          id: 'tsk_st_2',
          title: 'Assessment: Module 2 Quiz - Policy Enforcement Points (PEP)',
          category: 'quiz',
          courseTitle: 'Network Security & Zero Trust Architecture',
          courseId: 'crs_sec_01',
          dueDate: 'Oct 19, 2026',
          priority: 'high',
          completed: false,
          actionLabel: 'Take Quiz Now',
          actionTarget: 'courses',
          actionParam: 'crs_sec_01'
        },
        {
          id: 'tsk_st_3',
          title: 'Capstone: Upload Cloud Architecture Defense Specification (PDF)',
          category: 'assignment',
          courseTitle: 'Cloud Native Microservices Architecture',
          courseId: 'crs_cloud_02',
          dueDate: 'Oct 23, 2026',
          priority: 'medium',
          completed: false,
          actionLabel: 'Submit Assignment',
          actionTarget: 'courses',
          actionParam: 'crs_cloud_02'
        },
        {
          id: 'tsk_st_4',
          title: 'Review Faculty Rubric & Scores on Cryptographic Lab 1',
          category: 'review',
          courseTitle: 'Network Security & Zero Trust Architecture',
          dueDate: 'Completed Oct 14',
          priority: 'low',
          completed: true,
          actionLabel: 'View Graded Scorecard',
          actionTarget: 'assessments'
        },
        {
          id: 'tsk_st_5',
          title: 'Inspect Official SHA-256 Verifiable Certificate',
          category: 'review',
          courseTitle: 'Network Security & Zero Trust Architecture',
          dueDate: 'Permanent Credential',
          priority: 'low',
          completed: true,
          actionLabel: 'Open Certificate',
          actionTarget: 'certificates'
        }
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        {
          id: 'tsk_adm_1',
          title: 'Evaluate 3 Pending Capstone Submissions for Alexandria Miller',
          category: 'grading',
          courseTitle: 'Network Security & Zero Trust Architecture',
          courseId: 'crs_sec_01',
          dueDate: 'Today, High Priority',
          priority: 'high',
          completed: false,
          actionLabel: 'Launch Grading Studio',
          actionTarget: 'grading'
        },
        {
          id: 'tsk_adm_2',
          title: 'Review Curriculum Draft v1.3 for Network Security',
          category: 'governance',
          courseTitle: 'Network Security & Zero Trust Architecture',
          courseId: 'crs_sec_01',
          dueDate: 'Oct 19, 2026',
          priority: 'high',
          completed: false,
          actionLabel: 'Open Course Studio',
          actionTarget: 'courses',
          actionParam: 'crs_sec_01'
        },
        {
          id: 'tsk_adm_3',
          title: 'Respond to Student Ticket #TK-8802 (Calico CNI Lab Query)',
          category: 'support',
          courseTitle: 'General Student Support',
          dueDate: 'In 4 hours',
          priority: 'high',
          completed: false,
          actionLabel: 'Open Inquiries',
          actionTarget: 'support'
        },
        {
          id: 'tsk_adm_4',
          title: 'Verify Eligibility and Issue Certificate for James Chen',
          category: 'review',
          courseTitle: 'Distributed Systems & High-Load Architecture',
          dueDate: 'Oct 21, 2026',
          priority: 'medium',
          completed: false,
          actionLabel: 'Open Registry',
          actionTarget: 'certificates'
        },
        {
          id: 'tsk_adm_5',
          title: 'Test Webhook Event Trigger for Grade Synchronization',
          category: 'governance',
          courseTitle: 'Platform Integrations',
          dueDate: 'Routine Maintenance',
          priority: 'low',
          completed: true,
          actionLabel: 'Test Webhooks',
          actionTarget: 'integrations'
        }
      ];
    }

    // Super Admin Tasks
    return [
      {
        id: 'tsk_sa_1',
        title: 'Publish Course Governance Approval: Release v2.0 of Distributed Systems',
        category: 'governance',
        courseTitle: 'Distributed Systems & High-Load Architecture',
        courseId: 'crs_cloud_02',
        dueDate: 'Immediate Action Required',
        priority: 'high',
        completed: false,
        actionLabel: 'Inspect & Publish',
        actionTarget: 'courses',
        actionParam: 'crs_cloud_02'
      },
      {
        id: 'tsk_sa_2',
        title: 'Quarterly IAM Privileged Access Review & MFA Enforcement Check',
        category: 'governance',
        courseTitle: 'Security Compliance Standards ISO-27001',
        dueDate: 'Oct 20, 2026',
        priority: 'high',
        completed: false,
        actionLabel: 'Launch IAM Governance',
        actionTarget: 'users'
      },
      {
        id: 'tsk_sa_3',
        title: 'Triage Flagged Incident Event #EVT-904 (Failed login from 194.26.29.11)',
        category: 'review',
        courseTitle: 'Zero-Trust Audit Log Engine',
        dueDate: 'Today',
        priority: 'high',
        completed: false,
        actionLabel: 'Inspect Audit Trail',
        actionTarget: 'audit'
      },
      {
        id: 'tsk_sa_4',
        title: 'Execute PostgreSQL 16 Snapshot & Verify Row-Level Security Rules',
        category: 'governance',
        courseTitle: 'Infrastructure Operations',
        dueDate: 'Oct 25, 2026',
        priority: 'medium',
        completed: false,
        actionLabel: 'Check System Health',
        actionTarget: 'health'
      },
      {
        id: 'tsk_sa_5',
        title: 'Audit Webhook Delivery Reliability & Rotate Stale API Keys',
        category: 'governance',
        courseTitle: 'Cloud APIs & Microservices',
        dueDate: 'Scheduled Maintenance',
        priority: 'low',
        completed: true,
        actionLabel: 'Manage Cloud APIs',
        actionTarget: 'integrations'
      }
    ];
  };

  const [tasks, setTasks] = useState<TaskItem[]>(getInitialTasks());

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          logEvent({
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: 'TASK_COMPLETED',
            entityType: 'system',
            entityId: t.id,
            details: `User completed task: "${t.title}"`,
            severity: 'info'
          });
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonalTask.trim()) return;

    const newTask: TaskItem = {
      id: `tsk_cust_${Date.now()}`,
      title: newPersonalTask.trim(),
      category: 'personal',
      dueDate: 'Self-Scheduled',
      priority: 'medium',
      completed: false,
      actionLabel: 'Mark Done',
      actionTarget: 'tasks'
    };

    setTasks([newTask, ...tasks]);
    setNewPersonalTask('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending') return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    if (activeFilter === 'high') return t.priority === 'high' && !t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  const getCategoryIcon = (category: TaskItem['category']) => {
    switch (category) {
      case 'lab':
        return <Terminal className="w-4 h-4 text-emerald-600" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-blue-600" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'grading':
        return <CheckCircle2 className="w-4 h-4 text-amber-600" />;
      case 'governance':
        return <ShieldCheck className="w-4 h-4 text-rose-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-300 font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              {currentUser.role === 'student'
                ? 'Student Learning Milestones & Labs'
                : currentUser.role === 'admin'
                  ? 'Instructional Operations & Grading Queue'
                  : 'Root Platform Governance & Compliance Tasks'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Role Action Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            {currentUser.role === 'student'
              ? 'Complete hands-on sandbox labs, submit module capstones, and maintain your learning velocity.'
              : currentUser.role === 'admin'
                ? 'Review student submissions against rubrics, audit course drafts, and resolve student inquiries.'
                : 'Execute root platform governance approvals, audit privilege delegations, and monitor system resilience.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Action Task</span>
        </button>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Completion Rate</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{progressPercent}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Pending Tasks</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{pendingCount}</div>
          <div className="text-[11px] text-slate-400">Actionable items</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>High Priority</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{highPriorityCount}</div>
          <div className="text-[11px] text-amber-600 font-medium">Requires attention</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{completedCount}</div>
          <div className="text-[11px] text-purple-600 font-medium">Archived milestones</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'high'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            High Priority ({highPriorityCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Active Role: <strong className="text-slate-700 uppercase">{currentUser.role.replace('_', ' ')}</strong>
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">All filtered tasks are up to date!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no pending actions matching this filter. Switch filters or add a new task to organize your work.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                task.completed
                  ? 'bg-slate-50/70 border-slate-200/80 opacity-80'
                  : task.priority === 'high'
                    ? 'bg-white border-blue-200 hover:border-blue-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Checkbox toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                  title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1 rounded bg-slate-100 text-slate-700">
                      {getCategoryIcon(task.category)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      task.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority} Priority
                    </span>
                    {task.courseTitle && (
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                        • {task.courseTitle}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-bold text-slate-900 leading-snug ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigate(task.actionTarget, task.actionParam)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <span>{task.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Create Action Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Description / Goal
                </label>
                <input
                  type="text"
                  value={newPersonalTask}
                  onChange={e => setNewPersonalTask(e.target.value)}
                  placeholder="e.g. Complete Kubernetes CNI lab or review pull request..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold">Role Attribution:</span>
                <p className="text-[11px] text-blue-800">
                  This task will be pinned to your <strong>{currentUser.role.replace('_', ' ')}</strong> workspace and synced across sessions.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
