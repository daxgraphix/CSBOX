import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, RoleType, Permission } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  isSuspended: boolean;
  switchUser: (userId: string) => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: RoleType | RoleType[]) => boolean;
  suspendUser: (userId: string, reason: string) => void;
  unsuspendUser: (userId: string) => void;
  assignRole: (userId: string, role: RoleType) => void;
  updateUserPreferences: (prefs: Partial<User['preferences']>) => void;
  activePortal: 'public' | 'learner' | 'instructor' | 'reviewer' | 'admin' | 'organization' | 'support';
  setActivePortal: (portal: 'public' | 'learner' | 'instructor' | 'reviewer' | 'admin' | 'organization' | 'support') => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, role: RoleType, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setMfaEnabled: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  super_admin: [
    'course.create',
    'course.update.own',
    'course.update.any',
    'course.review.assigned',
    'course.publish',
    'course.unpublish',
    'user.manage',
    'user.suspend',
    'role.assign',
    'certificate.issue',
    'certificate.revoke',
    'audit.read',
    'grading.manage',
    'org.manage',
    'course.review',
    'review.submit',
    'support.ticket.create',
    'support.ticket.manage',
    'organization.manage',
    'organization.member.manage',
  ],
  admin: [
    'course.create',
    'course.update.own',
    'course.publish',
    'grading.manage',
    'certificate.issue',
    'course.review',
    'review.submit',
    'support.ticket.create',
    'organization.manage',
    'organization.member.manage',
  ],
  instructor: [
    'course.create',
    'course.update.own',
    'grading.manage',
    'certificate.issue',
    'course.review',
    'review.submit',
    'support.ticket.create',
  ],
  reviewer: [
    'course.review.assigned',
    'course.review',
    'review.submit',
    'grading.manage',
    'support.ticket.create',
  ],
  student: [
    'support.ticket.create',
  ],
  organization: [
    'organization.manage',
    'organization.member.manage',
    'course.create',
    'course.update.own',
    'certificate.issue',
    'support.ticket.create',
    'support.ticket.manage',
  ],
  support: [
    'user.manage',
    'support.ticket.create',
    'support.ticket.manage',
    'audit.read',
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activePortal, setActivePortal] = useState<'public' | 'learner' | 'instructor' | 'reviewer' | 'admin' | 'organization' | 'support'>('public');
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  const currentUser = currentUserId ? (users.find(u => u.id === currentUserId) || null) : null;
  const isAuthenticated = currentUserId !== null;

  // Load saved session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('csbox_session');
    if (saved) {
      try {
        const { userId, portal, rememberMe } = JSON.parse(saved);
        if (rememberMe) {
          const user = users.find(u => u.id === userId);
          if (user && !user.isSuspended) {
            setCurrentUserId(userId);
            setActivePortal(portal as any);
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    setIsLoadingSession(false);
  }, [users]);

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    setCurrentUserId(userId);

    // Auto-align default portal based on persona
    switch (target.role) {
      case 'super_admin':
      case 'admin':
        setActivePortal('admin');
        break;
      case 'instructor':
        setActivePortal('instructor');
        break;
      case 'reviewer':
        setActivePortal('reviewer');
        break;
      case 'organization':
        setActivePortal('organization');
        break;
      case 'support':
        setActivePortal('support');
        break;
      case 'student':
      default:
        setActivePortal('learner');
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser || currentUser.isSuspended) return false;
    const userPermissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role: RoleType | RoleType[]): boolean => {
    if (!currentUser || currentUser.isSuspended) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  const suspendUser = (userId: string, reason: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          isSuspended: true,
          suspensionReason: reason,
        };
      }
      return u;
    }));
  };

  const unsuspendUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          isSuspended: false,
          suspensionReason: undefined,
        };
      }
      return u;
    }));
  };

  const assignRole = (userId: string, newRole: RoleType) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  const updateUserPreferences = (prefs: Partial<User['preferences']>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser?.id) {
        return {
          ...u,
          preferences: { ...u.preferences, ...prefs },
        };
      }
      return u;
    }));
  };

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (user.isSuspended) {
      throw new Error('Account is suspended. Please contact support.');
    }
    setCurrentUserId(user.id);
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        setActivePortal('admin');
        break;
      case 'instructor':
        setActivePortal('instructor');
        break;
      case 'reviewer':
        setActivePortal('reviewer');
        break;
      case 'organization':
        setActivePortal('organization');
        break;
      case 'support':
        setActivePortal('support');
        break;
      case 'student':
      default:
        setActivePortal('learner');
    }
    if (rememberMe) {
      localStorage.setItem('csbox_session', JSON.stringify({
        userId: user.id,
        portal: user.role === 'super_admin' || user.role === 'admin' ? 'admin' :
          user.role === 'instructor' ? 'instructor' :
          user.role === 'reviewer' ? 'reviewer' :
          user.role === 'organization' ? 'organization' :
          user.role === 'support' ? 'support' : 'learner',
        rememberMe: true,
      }));
    }
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUserId(null);
    setActivePortal('public');
    localStorage.removeItem('csbox_session');
  }, []);

  const register = useCallback(async (email: string, password: string, role: RoleType, fullName: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: fullName,
      email,
      avatar: '',
      role,
      isSuspended: false,
      lastLogin: new Date().toISOString(),
      mfaEnabled: false,
      preferences: {
        language: 'en',
        emailNotifications: true,
        smsNotifications: false,
      },
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    switch (role) {
      case 'super_admin':
      case 'admin':
        setActivePortal('admin');
        break;
      case 'instructor':
        setActivePortal('instructor');
        break;
      case 'reviewer':
        setActivePortal('reviewer');
        break;
      case 'organization':
        setActivePortal('organization');
        break;
      case 'support':
        setActivePortal('support');
        break;
      case 'student':
      default:
        setActivePortal('learner');
    }
  }, [users]);

  const resetPassword = useCallback(async (email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('No account found with this email');
    }
    // In a real app, this would send a reset email
    return { success: true, message: 'Password reset link sent to ' + email };
  }, [users]);

  const setMfaEnabled = useCallback(async (enabled: boolean) => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, mfaEnabled: enabled };
      }
      return u;
    }));
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: users,
        isAuthenticated,
        isSuspended: currentUser?.isSuspended ?? false,
        switchUser,
        hasPermission,
        hasRole,
        suspendUser,
        unsuspendUser,
        assignRole,
        updateUserPreferences,
        activePortal,
        setActivePortal,
        login,
        logout,
        register,
        resetPassword,
        setMfaEnabled,
        isLoadingSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
