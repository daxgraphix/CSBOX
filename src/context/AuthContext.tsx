import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, RoleType, Permission } from '../types';
import getSupabase from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  isSuspended: boolean;
  isLoadingSession: boolean;
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
  logout: () => Promise<void>;
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

const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  name: profile.full_name,
  email: profile.email,
  avatar: profile.avatar_url || '',
  role: profile.role,
  organizationId: profile.organization_id,
  organizationName: profile.organization_name,
  isSuspended: profile.is_suspended,
  suspensionReason: profile.suspension_reason,
  lastLogin: profile.last_login || new Date().toISOString(),
  mfaEnabled: profile.mfa_enabled,
  preferences: {
    language: (profile.language_preference as 'en' | 'sw') || 'en',
    emailNotifications: profile.email_notifications ?? true,
    smsNotifications: profile.sms_notifications ?? false,
  },
});

const portalForRole = (role: RoleType): 'public' | 'learner' | 'instructor' | 'reviewer' | 'admin' | 'organization' | 'support' => {
  switch (role) {
    case 'super_admin':
    case 'admin': return 'admin';
    case 'instructor': return 'instructor';
    case 'reviewer': return 'reviewer';
    case 'organization': return 'organization';
    case 'support': return 'support';
    case 'student':
    default: return 'learner';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePortal, setActivePortal] = useState<'public' | 'learner' | 'instructor' | 'reviewer' | 'admin' | 'organization' | 'support'>('public');
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  const isAuthenticated = currentUser !== null;
  const isSuspended = currentUser?.isSuspended ?? false;

  // Load saved session from Supabase on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && mounted) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (!error && profile && mounted) {
          const user = mapProfileToUser(profile);
          setUsers([user]);
          setCurrentUser(user);
          setActivePortal(portalForRole(user.role));
        }
      }

      if (mounted) setIsLoadingSession(false);
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const supabaseAuthChange = useCallback(() => {
    const supabase = getSupabase();
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (!error && profile) {
            const user = mapProfileToUser(profile);
            setUsers(prev => prev.some(u => u.id === user.id) ? prev : [...prev, user]);
            setCurrentUser(user);
            setActivePortal(portalForRole(user.role));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUsers([]);
        setActivePortal('public');
        localStorage.removeItem('csbox_session');
      }
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabaseAuthChange();
    return () => subscription.unsubscribe();
  }, [supabaseAuthChange]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentUser || currentUser.isSuspended) return false;
    const userPermissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return userPermissions.includes(permission);
  }, [currentUser]);

  const hasRole = useCallback((role: RoleType | RoleType[]): boolean => {
    if (!currentUser || currentUser.isSuspended) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  }, [currentUser]);

  const suspendUser = useCallback((userId: string, reason: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isSuspended: true, suspensionReason: reason };
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, isSuspended: true, suspensionReason: reason } : null);
    }
  }, [currentUser]);

  const unsuspendUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isSuspended: false, suspensionReason: undefined };
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, isSuspended: false, suspensionReason: undefined } : null);
    }
  }, [currentUser]);

  const assignRole = useCallback((userId: string, newRole: RoleType) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
      setActivePortal(portalForRole(newRole));
    }
  }, [currentUser]);

  const updateUserPreferences = useCallback((prefs: Partial<User['preferences']>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser?.id) {
        return { ...u, preferences: { ...u.preferences, ...prefs } };
      }
      return u;
    }));
    setCurrentUser(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...prefs } } : null);
  }, [currentUser]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('Profile not found. Please contact support.');
    }

    const user = mapProfileToUser(profile);

    if (user.isSuspended) {
      await supabase.auth.signOut();
      throw new Error('Account is suspended. Please contact support.');
    }

    setUsers(prev => prev.some(u => u.id === user.id) ? prev : [...prev, user]);
    setCurrentUser(user);
    setActivePortal(portalForRole(user.role));

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
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUsers([]);
    setActivePortal('public');
    localStorage.removeItem('csbox_session');
  }, []);

  const register = useCallback(async (email: string, password: string, role: RoleType, fullName: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      throw new Error(error?.message || 'Registration failed');
    }

    const newUser: User = {
      id: data.user.id,
      name: fullName,
      email,
      avatar: '',
      role,
      organizationId: undefined,
      organizationName: undefined,
      isSuspended: false,
      suspensionReason: undefined,
      lastLogin: new Date().toISOString(),
      mfaEnabled: false,
      preferences: {
        language: 'en',
        emailNotifications: true,
        smsNotifications: false,
      },
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        is_suspended: false,
        mfa_enabled: false,
        language_preference: 'en',
        email_notifications: true,
        sms_notifications: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

    if (insertError) {
      throw new Error(insertError.message);
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setActivePortal(portalForRole(role));
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Password reset link sent to ' + email };
  }, []);

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
    setCurrentUser(prev => prev ? { ...prev, mfaEnabled: enabled } : null);
  }, [currentUser]);

  const switchUser = useCallback((userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    setCurrentUser(target);
    setActivePortal(portalForRole(target.role));
  }, [users]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: users,
        isAuthenticated,
        isSuspended,
        isLoadingSession,
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
