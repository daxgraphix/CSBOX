import React, { useState } from 'react';
import { 
  GraduationCap, 
  Shield, 
  BookOpen, 
  CheckSquare, 
  Settings, 
  Building2, 
  LifeBuoy, 
  Download, 
  ChevronDown, 
  Globe, 
  User as UserIcon,
  Bell,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types';

interface NavbarProps {
  onOpenZipModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenZipModal }) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    activePortal, 
    setActivePortal, 
    updateUserPreferences 
  } = useAuth();
  
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const portals = [
    { id: 'public', label: 'Public Catalog', icon: BookOpen },
    { id: 'learner', label: 'Learner Portal', icon: GraduationCap },
    { id: 'instructor', label: 'Instructor Studio', icon: CheckSquare },
    { id: 'reviewer', label: 'Reviewer QA', icon: Shield },
    { id: 'admin', label: 'Governance & Admin', icon: Settings },
    { id: 'organization', label: 'Org Cohorts', icon: Building2 },
    { id: 'support', label: 'Support Desk', icon: LifeBuoy },
  ] as const;

  const roleLabels: Record<RoleType, { title: string; color: string }> = {
    super_admin: { title: 'Super Admin', color: 'bg-rose-500/10 text-rose-600 border-rose-300' },
    admin: { title: 'Admin', color: 'bg-blue-500/10 text-blue-600 border-blue-300' },
    student: { title: 'Normal Student', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-300' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-8 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">Enterprise LMS Core v2.4</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">PostgreSQL + RLS + Express Backend</span>
        </div>

        <div className="flex items-center gap-4">
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.preferences.language === 'sw' ? 'Kiswahili (SW)' : 'English (EN)'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                <button
                  onClick={() => {
                    updateUserPreferences({ language: 'en' });
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 ${currentUser.preferences.language === 'en' ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => {
                    updateUserPreferences({ language: 'sw' });
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 ${currentUser.preferences.language === 'sw' ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}
                >
                  Kiswahili (SW)
                </button>
              </div>
            )}
          </div>

          {/* Quick Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-100">{currentUser.name.split(' ')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${roleLabels[currentUser.role]?.color || ''}`}>
                {roleLabels[currentUser.role]?.title}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Persona / Role Tester
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {allUsers.map(user => {
                    const isSelected = user.id === currentUser.id;
                    const badge = roleLabels[user.role];
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center justify-between">
                            <span>{user.name}</span>
                            {user.isSuspended && (
                              <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded">Suspended</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                          <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded border mt-0.5 ${badge?.color || ''}`}>
                            {badge?.title}
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
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          onClick={() => setActivePortal('public')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              LearnSphere <span className="text-blue-600 font-bold">Enterprise</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium tracking-wide">
              LMS, Governance & Compliance Studio
            </div>
          </div>
        </div>

        {/* Portals Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          {portals.map(portal => {
            const Icon = portal.icon;
            const isActive = activePortal === portal.id;
            return (
              <button
                key={portal.id}
                onClick={() => setActivePortal(portal.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{portal.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action: Download Project .ZIP */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenZipModal}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer hover:shadow-lg active:scale-95"
            title="Inspect and Download Full Project Codebase in .ZIP"
          >
            <Download className="w-4 h-4 text-blue-200" />
            <span className="hidden sm:inline">Download Full Project</span>
            <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
              .ZIP
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Portal Navigation Bar */}
      <div className="lg:hidden px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
        {portals.map(portal => {
          const Icon = portal.icon;
          const isActive = activePortal === portal.id;
          return (
            <button
              key={portal.id}
              onClick={() => setActivePortal(portal.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap ${
                isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{portal.label}</span>
            </button>
          );
        })}
      </div>

    </header>
  );
};
