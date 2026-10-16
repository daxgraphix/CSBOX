import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Plus, 
  UploadCloud, 
  Calendar, 
  CheckCircle, 
  FileSpreadsheet, 
  AlertCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

export const OrgDashboard: React.FC = () => {
  const { organizations, courses, createCohort, bulkEnrollCohortLearners } = useCourse();
  const { currentUser } = useAuth();

  const org = organizations[0]; // Active organization
  const [selectedCohortId, setSelectedCohortId] = useState<string>(org?.cohorts[0]?.id || '');

  // Create Cohort Modal
  const [showNewCohortModal, setShowNewCohortModal] = useState(false);
  const [cohortName, setCohortName] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(['crs_sec_01']);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2027-01-31');

  // Bulk CSV Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [csvEmails, setCsvEmails] = useState(
    'sam.kariuki@telcom-kenya.co.ke\nfaith.nduta@telcom-kenya.co.ke\nbrian.omondi@telcom-kenya.co.ke'
  );
  const [importResult, setImportResult] = useState<{ importedCount: number; existingCount: number } | null>(null);

  const selectedCohort = org?.cohorts.find(c => c.id === selectedCohortId) || org?.cohorts[0];

  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName.trim() || !org) return;

    createCohort(org.id, cohortName, selectedCourseIds, startDate, endDate);
    setShowNewCohortModal(false);
    setCohortName('');
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || !selectedCohort) return;

    const emailList = csvEmails
      .split(/[\n,]/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    const res = bulkEnrollCohortLearners(org.id, selectedCohort.id, emailList);
    setImportResult(res);
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Institutional B2B Training Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {org ? org.name : 'Enterprise Institutional Workspace'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage company cohorts, bulk onboarding, seat allocations, and enterprise workforce training pathways.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewCohortModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Cohort</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      {org && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-slate-500">Seat Utilization</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {org.activeSeats} <span className="text-sm font-normal text-slate-400">/ {org.seatLimit}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{ width: `${(org.activeSeats / org.seatLimit) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-slate-500">Active Training Cohorts</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{org.cohorts.length}</div>
            <div className="text-[11px] text-slate-400">Scheduled programs</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-slate-500">Assigned Enterprise Curricula</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{org.assignedCourseIds.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Licensed under master agreement</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-slate-500">Enterprise Completion SLA</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">88.4%</div>
            <div className="text-[11px] text-purple-600 font-medium">Cohort on-track</div>
          </div>
        </div>
      )}

      {/* Cohorts Management & Roster */}
      {org && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Cohorts list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Organizational Cohorts
            </div>

            <div className="space-y-2">
              {org.cohorts.map(coh => {
                const isSelected = coh.id === selectedCohort?.id;
                return (
                  <div
                    key={coh.id}
                    onClick={() => {
                      setSelectedCohortId(coh.id);
                      setImportResult(null);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm mb-1">{coh.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{coh.memberEmails.length} enrolled employees</span>
                      <span>Ends {new Date(coh.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Cohort Roster & Bulk CSV Action */}
          {selectedCohort && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                    Active Cohort
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedCohort.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Schedule: {selectedCohort.startDate} to {selectedCohort.endDate}
                  </div>
                </div>

                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Bulk CSV Import</span>
                </button>
              </div>

              {/* Roster Table */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Enrolled Cohort Members ({selectedCohort.memberEmails.length})</span>
                  <span className="text-slate-400 font-normal">Active access granted</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {selectedCohort.memberEmails.map((email, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-slate-800">{email}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        License Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Member Management & Cohort Progress */}
      {org && selectedCohort && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Cohort Member Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedCohort.memberEmails.map((email, idx) => {
              const progress = Math.floor(Math.random() * 100);
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{email.split('@')[0]}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      progress >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      progress >= 50 ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                    <span>{progress >= 80 ? 'On Track' : progress >= 50 ? 'In Progress' : 'Needs Attention'}</span>
                    <span className="font-mono">{selectedCohort.memberEmails.length - idx - 1} remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <span>Bulk CSV Learner Onboarding</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste employee email addresses (separated by commas or new lines). The system verifies enterprise seat limits, prevents duplicate enrollments, and grants course access.
            </p>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Learner Emails (CSV / List)
                </label>
                <textarea
                  rows={5}
                  required
                  value={csvEmails}
                  onChange={e => setCsvEmails(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              {importResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Import Complete!</span>
                  </div>
                  <div>Successfully onboarded {importResult.importedCount} new learners. (Skipped {importResult.existingCount} duplicates).</div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Execute Batch Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Cohort Modal */}
      {showNewCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Create Organizational Cohort</h3>
            <form onSubmit={handleCreateCohort} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={cohortName}
                  onChange={e => setCohortName(e.target.value)}
                  placeholder="e.g. 2027 Executive Zero Trust Cohort"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCohortModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
