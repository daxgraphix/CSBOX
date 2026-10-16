import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Compass, 
  ClipboardList, 
  Award, 
  LifeBuoy, 
  Users, 
  ShieldCheck, 
  Database, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChevronDown, 
  Sparkles,
  Layers,
  FileCheck,
  Webhook,
  Box,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types';

export type NavItemKey = 
  | 'dashboard'
  | 'tasks'
  | 'courses'
  | 'catalog'
  | 'assessments'
  | 'certificates'
  | 'grading'
  | 'users'
  | 'audit'
  | 'health'
  | 'integrations'
  | 'support'
  | 'my_plan';

interface SidebarProps {
  activeKey: NavItemKey;
  onSelectKey: (key: NavItemKey) => void;
  isCompact: boolean;
  onToggleCompact: () => void;
  onOpenZipModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeKey,
  onSelectKey,
  isCompact,
  onToggleCompact,
  onOpenZipModal,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Define screen lists strictly based on the 3 roles
  const getNavSections = () => {
    if (currentUser.role === 'student') {
      // Normal Student: Focused, few screens only
      return [
        {
          title: 'Learning Hub',
          items: [
            { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: Home },
            { key: 'tasks' as NavItemKey, label: 'Assigned Tasks & Labs', icon: CheckCircle },
            { key: 'courses' as NavItemKey, label: 'My Learning & Player', icon: BookOpen },
            { key: 'catalog' as NavItemKey, label: 'Explore Catalog', icon: Compass },
            { key: 'assessments' as NavItemKey, label: 'My Quizzes & Grades', icon: ClipboardList },
            { key: 'certificates' as NavItemKey, label: 'My Certificates', icon: Award },
          ]
        },
        {
          title: 'Assistance',
          items: [
            { key: 'support' as NavItemKey, label: 'Support Desk', icon: LifeBuoy },
          ]
        }
      ];
    }

    if (currentUser.role === 'admin') {
      // Admin: Tasks, Course Studio, Grading, Catalog, Certificates, Integrations, Support
      return [
        {
          title: 'Instructional Operations',
          items: [
            { key: 'dashboard' as NavItemKey, label: 'Overview', icon: Home },
            { key: 'tasks' as NavItemKey, label: 'Instructional Tasks', icon: CheckCircle },
            { key: 'courses' as NavItemKey, label: 'Course Studio', icon: BookOpen },
            { key: 'grading' as NavItemKey, label: 'Student Grading', icon: FileCheck },
            { key: 'catalog' as NavItemKey, label: 'Course Catalog', icon: Layers },
          ]
        },
        {
          title: 'Academic Services',
          items: [
            { key: 'certificates' as NavItemKey, label: 'Certificates Registry', icon: Award },
            { key: 'integrations' as NavItemKey, label: 'Webhooks & Cloud APIs', icon: Webhook },
            { key: 'support' as NavItemKey, label: 'Student Inquiries', icon: LifeBuoy },
          ]
        }
      ];
    }

    if (currentUser.role === 'instructor') {
      // Instructor: Course building, grading, student management
      return [
        {
          title: 'Course Authoring',
          items: [
            { key: 'dashboard' as NavItemKey, label: 'Instructor Studio', icon: Home },
            { key: 'tasks' as NavItemKey, label: 'My Tasks & Deadlines', icon: CheckCircle },
            { key: 'courses' as NavItemKey, label: 'Course Builder', icon: BookOpen },
            { key: 'grading' as NavItemKey, label: 'Grade Submissions', icon: FileCheck },
            { key: 'catalog' as NavItemKey, label: 'Course Catalog', icon: Layers },
          ]
        },
        {
          title: 'Student Management',
          items: [
            { key: 'certificates' as NavItemKey, label: 'Issue Certificates', icon: Award },
            { key: 'support' as NavItemKey, label: 'Student Support', icon: LifeBuoy },
          ]
        }
      ];
    }

    if (currentUser.role === 'reviewer') {
      // Reviewer: Course review, grading, quality assurance
      return [
        {
          title: 'Review Queue',
          items: [
            { key: 'dashboard' as NavItemKey, label: 'Reviewer Dashboard', icon: Home },
            { key: 'tasks' as NavItemKey, label: 'Pending Reviews', icon: CheckCircle },
            { key: 'courses' as NavItemKey, label: 'Courses Under Review', icon: BookOpen },
            { key: 'grading' as NavItemKey, label: 'Grading Studio', icon: FileCheck },
          ]
        },
        {
          title: 'Quality Assurance',
          items: [
            { key: 'catalog' as NavItemKey, label: 'Published Catalog', icon: Layers },
            { key: 'certificates' as NavItemKey, label: 'Certificate Verification', icon: Award },
            { key: 'support' as NavItemKey, label: 'Academic Inquiries', icon: LifeBuoy },
          ]
        }
      ];
    }

    if (currentUser.role === 'organization') {
      // Organization: Cohort management, member management, org settings
      return [
        {
          title: 'Institutional Workspace',
          items: [
            { key: 'dashboard' as NavItemKey, label: 'Org Dashboard', icon: Home },
            { key: 'tasks' as NavItemKey, label: 'Cohort Management', icon: CheckCircle },
            { key: 'courses' as NavItemKey, label: 'Organization Courses', icon: BookOpen },
            { key: 'catalog' as NavItemKey, label: 'Course Catalog', icon: Layers },
          ]
        },
        {
          title: 'Member & Billing',
          items: [
            { key: 'certificates' as NavItemKey, label: 'Member Certificates', icon: Award },
            { key: 'support' as NavItemKey, label: 'Org Support', icon: LifeBuoy },
            { key: 'my_plan' as NavItemKey, label: 'Enterprise Plan', icon: Sparkles },
          ]
        }
      ];
    }

    if (currentUser.role === 'support') {
      // Support: Ticket management, user lookup, support operations
      return [
        {
          title: 'Support Operations',
          items: [
            { key: 'dashboard' as NavItemKey, label: 'Support Center', icon: Home },
            { key: 'tasks' as NavItemKey, label: 'Open Tickets', icon: CheckCircle },
            { key: 'users' as NavItemKey, label: 'User Lookup', icon: Users },
            { key: 'support' as NavItemKey, label: 'Ticket Management', icon: LifeBuoy },
          ]
        },
        {
          title: 'Platform Reference',
          items: [
            { key: 'catalog' as NavItemKey, label: 'Course Catalog', icon: Layers },
            { key: 'certificates' as NavItemKey, label: 'Certificate Verification', icon: Award },
            { key: 'audit' as NavItemKey, label: 'Audit Trail', icon: ShieldCheck },
          ]
        }
      ];
    }

    // Super Admin: Complete governance, IAM, Audits, Operations, + Course Studio
    return [
      {
        title: 'Core Administration',
        items: [
          { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: Home },
          { key: 'tasks' as NavItemKey, label: 'Governance Tasks', icon: CheckCircle },
          { key: 'courses' as NavItemKey, label: 'Course Studio', icon: BookOpen },
          { key: 'grading' as NavItemKey, label: 'Student Grading', icon: FileCheck },
          { key: 'catalog' as NavItemKey, label: 'Course Catalog', icon: Layers },
          { key: 'certificates' as NavItemKey, label: 'Certificates Registry', icon: Award },
        ]
      },
      {
        title: 'Platform Governance',
        items: [
          { key: 'users' as NavItemKey, label: 'User & IAM Governance', icon: Users },
          { key: 'audit' as NavItemKey, label: 'Immutable Audit Trail', icon: ShieldCheck },
          { key: 'integrations' as NavItemKey, label: 'Webhooks & Cloud APIs', icon: Webhook },
          { key: 'health' as NavItemKey, label: 'System Health & Ops', icon: Database },
        ]
      },
      {
        title: 'Account',
        items: [
          { key: 'my_plan' as NavItemKey, label: 'Enterprise Plan', icon: Sparkles },
          { key: 'support' as NavItemKey, label: 'Support Operations', icon: LifeBuoy },
        ]
      }
    ];
  };

  const sections = getNavSections();

  const roleBadgeConfig: Record<RoleType, { label: string; bg: string; text: string; border: string }> = {
    super_admin: { label: 'Super Admin', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    admin: { label: 'Admin', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    instructor: { label: 'Instructor', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    reviewer: { label: 'Reviewer', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    student: { label: 'Student', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    organization: { label: 'Organization', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    support: { label: 'Support', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  };

  const currentBadge = roleBadgeConfig[currentUser.role];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`bg-white border-r border-slate-200 h-screen flex flex-col justify-between select-none transition-all duration-200 z-50 shrink-0 md:sticky md:top-0 ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl flex'
            : isCompact
              ? 'hidden md:flex md:w-18'
              : 'hidden md:flex md:w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div 
            onClick={() => {
              onSelectKey('dashboard');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Csbox Box Logo */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center p-1.5 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5 text-white" />
            </div>
            {(!isCompact || isMobileOpen) && (
              <div className="flex items-baseline font-bold text-xl text-slate-900 tracking-tight">
                <span className="text-emerald-600 font-extrabold">Cs</span>
                <span className="text-slate-900 font-extrabold">box</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {(!isCompact || isMobileOpen) && (
              <button
                onClick={onOpenZipModal}
                className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Download full project repository in .zip"
              >
                .ZIP
              </button>
            )}

            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {(!isCompact || isMobileOpen) && (
                <div className="px-3 text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeKey === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onSelectKey(item.key);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={isCompact && !isMobileOpen ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3.5 py-2 text-[13px] font-medium rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/80 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      } ${isCompact && !isMobileOpen ? 'justify-center px-2' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                      {(!isCompact || isMobileOpen) && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Area: Compact View Toggle + User Switcher */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          
          {/* Compact View button (desktop only) */}
          <button
            onClick={onToggleCompact}
            className={`hidden md:flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ${
              isCompact ? 'justify-center' : ''
            }`}
          >
            {isCompact ? (
              <PanelLeftOpen className="w-4 h-4 text-slate-500" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-slate-500" />
                <span>Compact View</span>
              </>
            )}
          </button>

          {/* Persona Switcher / Profile Box */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`w-full flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors cursor-pointer ${
                isCompact && !isMobileOpen ? 'justify-center' : ''
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
              {(!isCompact || isMobileOpen) && (
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}>
                      {currentBadge.label}
                    </span>
                  </div>
                </div>
              )}
              {(!isCompact || isMobileOpen) && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            {roleMenuOpen && (
              <div className="absolute bottom-12 left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Switch Role Persona</span>
                </div>
                <div className="py-1 space-y-1">
                  {allUsers.map(u => {
                    const badge = roleBadgeConfig[u.role];
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setRoleMenuOpen(false);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                          u.id === currentUser.id ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-100'
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold leading-tight truncate">{u.name}</div>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border mt-0.5 ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </aside>
    </>
  );
};
