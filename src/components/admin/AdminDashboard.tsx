import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  BookOpen, 
  Activity, 
  Database, 
  Lock, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  UserX, 
  UserCheck, 
  Download, 
  RefreshCw,
  Server,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import { useAudit } from '../../context/AuditContext';
import { RoleType, User } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { allUsers, suspendUser, unsuspendUser, assignRole, currentUser } = useAuth();
  const { courses, unpublishCourse } = useCourse();
  const { logs, filterLogs, logEvent } = useAudit();

  const [activeTab, setActiveTab] = useState<'users' | 'governance' | 'audit' | 'health'>('users');

  // User management state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<RoleType | 'all'>('all');
  const [suspendModalUser, setSuspendModalUser] = useState<User | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Course governance unpublish modal
  const [unpublishCourseId, setUnpublishCourseId] = useState<string | null>(null);
  const [unpublishReason, setUnpublishReason] = useState('');

  // Audit filter state
  const [auditSearch, setAuditSearch] = useState('');
  const [auditSeverity, setAuditSeverity] = useState('all');
  const [auditEntity, setAuditEntity] = useState('all');

  const filteredUsers = allUsers.filter(u => {
    if (userSearch) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
    }
    if (userRoleFilter !== 'all') {
      return u.role === userRoleFilter;
    }
    return true;
  });

  const userStats = {
    total: allUsers.length,
    active: allUsers.filter(u => !u.isSuspended).length,
    suspended: allUsers.filter(u => u.isSuspended).length,
    byRole: allUsers.reduce<Record<RoleType, number>>((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<RoleType, number>),
  };

  const filteredLogs = filterLogs({
    search: auditSearch,
    severity: auditSeverity,
    entityType: auditEntity
  });

  const handleConfirmSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModalUser || !suspensionReason.trim()) return;

    suspendUser(suspendModalUser.id, suspensionReason);
    logEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'USER_ACCOUNT_SUSPENDED',
      entityType: 'user',
      entityId: suspendModalUser.id,
      details: `Suspended account ${suspendModalUser.email}. Recorded Justification: "${suspensionReason}"`,
      severity: 'critical'
    });

    setSuspendModalUser(null);
    setSuspensionReason('');
  };

  const handleConfirmUnpublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unpublishCourseId || !unpublishReason.trim()) return;

    unpublishCourse(unpublishCourseId, unpublishReason);
    setUnpublishCourseId(null);
    setUnpublishReason('');
  };

  const handleExportAuditLogs = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredLogs, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `csbox-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Platform Governance &amp; Administration Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Security &amp; Institutional Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enforce Role-Based Access Control, review tamper-evident audit trails, and oversee academic publishing compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
          <div className="text-right">
            <div className="font-bold text-slate-200">PostgreSQL 16</div>
            <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              RLS Active
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Identity &amp; RBAC ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'governance' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Governance ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Immutable Audit Trail ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'health' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Operations &amp; Health</span>
        </button>
      </div>

      {/* 1. Identity & RBAC View */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, or role..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as RoleType | 'all')}
                className="p-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="reviewer">Reviewer</option>
                <option value="student">Student</option>
                <option value="organization">Organization</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Showing {filteredUsers.length} accounts</span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-900">{userStats.total} total</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-5 py-3.5">Role Assignment</th>
                  <th className="px-5 py-3.5">MFA Status</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={e => assignRole(user.id, e.target.value as RoleType)}
                        disabled={user.id === currentUser.id}
                        className="p-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="instructor">Instructor</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="student">Student</option>
                        <option value="organization">Organization</option>
                        <option value="support">Support</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                        user.mfaEnabled ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.mfaEnabled ? 'Hardware MFA' : 'Password Only'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {user.isSuspended ? (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            Suspended
                          </span>
                          <div className="text-[10px] text-red-600 italic truncate max-w-[150px] mt-0.5" title={user.suspensionReason}>
                            "{user.suspensionReason}"
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {user.id !== currentUser.id && (
                        user.isSuspended ? (
                          <button
                            onClick={() => {
                              unsuspendUser(user.id);
                              logEvent({
                                actorId: currentUser.id,
                                actorName: currentUser.name,
                                actorRole: currentUser.role,
                                action: 'USER_ACCOUNT_REINSTATED',
                                entityType: 'user',
                                entityId: user.id,
                                details: `Reinstated account ${user.email}`,
                                severity: 'info'
                              });
                            }}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Reinstate Access
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModalUser(user)}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Suspend Account
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Course Governance View */}
      {activeTab === 'governance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Curriculum</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Active Catalog Version</th>
                  <th className="px-5 py-3.5">Enrollments</th>
                  <th className="px-5 py-3.5 text-right">Governance Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(course => {
                  const activeVer = course.versions.find(v => v.version === course.activeVersion) || course.versions[0];
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{course.title}</div>
                        <div className="text-[11px] text-slate-500">{course.category}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {course.instructorName}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          v{course.activeVersion} ({activeVer.status})
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600">
                        {course.enrollmentCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {activeVer.status === 'published' ? (
                          <button
                            onClick={() => setUnpublishCourseId(course.id)}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Emergency Unpublish
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unpublished / Archived</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Immutable Audit Trail View */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Filter logs by actor, action, details..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <select
                value={auditSeverity}
                onChange={e => setAuditSeverity(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={auditEntity}
                onChange={e => setAuditEntity(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
              >
                <option value="all">All Entities</option>
                <option value="course">Course</option>
                <option value="user">User</option>
                <option value="role">Role</option>
                <option value="certificate">Certificate</option>
                <option value="organization">Organization</option>
              </select>
            </div>

            <button
              onClick={handleExportAuditLogs}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Action Code</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        log.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-5 py-3 text-slate-700 whitespace-nowrap">
                      {log.actorName} <span className="text-slate-400">({log.actorRole})</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-sans text-xs">
                      {log.details}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 4. Platform Health View */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Database className="w-5 h-5 text-blue-600" />
              <span>PostgreSQL &amp; Storage Health</span>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Database Engine Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Online (v16.2-alpine)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Row-Level Security (RLS)</span>
                <span className="font-bold text-emerald-700">Enforced on 8 Tables</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Active Connection Pool</span>
                <span className="font-mono font-bold text-slate-800">12 / 100 pool clients</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Point-In-Time Recovery (PITR)</span>
                <span className="font-bold text-blue-600">Healthy (RPO: 5m, RTO: 15m)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>Background Workers &amp; Security Services</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Autonomous Certification Queue</span>
                <span className="font-bold text-emerald-700">Idle (0 backlog)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Audit Log Tamper Integrity</span>
                <span className="font-bold text-emerald-700">Valid (Hash chain intact)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Last Disaster Recovery Drill</span>
                <span className="font-mono text-slate-700">2026-10-01 (Passed)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Automated Answer Key Guard</span>
                <span className="font-bold text-emerald-700">Server-Side Verified</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Account Suspension Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Suspend Account Access</span>
            </div>

            <p className="text-xs text-slate-600">
              You are about to suspend <strong>{suspendModalUser.name}</strong> ({suspendModalUser.email}). Active sessions will be invalidated and protected endpoints denied.
            </p>

            <form onSubmit={handleConfirmSuspend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Justification Reason (Audit Record)
                </label>
                <textarea
                  rows={3}
                  required
                  value={suspensionReason}
                  onChange={e => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Academic integrity violation under investigation or security incident..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Unpublish Modal */}
      {unpublishCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Emergency Course Unpublish</span>
            </div>

            <p className="text-xs text-slate-600">
              This action immediately removes the curriculum from the public catalog while preserving existing learner progress.
            </p>

            <form onSubmit={handleConfirmUnpublish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Governance Unpublish Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={unpublishReason}
                  onChange={e => setUnpublishReason(e.target.value)}
                  placeholder="e.g. Critical regulatory update needed or copyright dispute..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnpublishCourseId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Execute Unpublish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
