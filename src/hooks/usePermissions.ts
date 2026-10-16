/**
 * Custom hook for centralized permission and role checking.
 * Replaces scattered hasPermission/hasRole calls across components.
 */

import { useAuth } from '../context/AuthContext';
import { Permission, RoleType } from '../types';
import { ROLES, ROLE_NAV_MAP, NavKey } from '../lib/constants';

interface UsePermissionsReturn {
  currentUserRole: RoleType | undefined;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: RoleType | RoleType[]) => boolean;
  hasAnyRole: (roles: RoleType[]) => boolean;
  canAccessNav: (navKey: NavKey) => boolean;
  allowedNavKeys: NavKey[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isSuspended: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { currentUser, hasPermission, hasRole, isSuspended } = useAuth();

  const currentUserRole = currentUser?.role;
  const isSuperAdmin = currentUserRole === ROLES.SUPER_ADMIN;
  const isAdmin = currentUserRole === ROLES.ADMIN;
  const isStudent = currentUserRole === ROLES.STUDENT;

  const hasAnyRole = (roles: RoleType[]): boolean => {
    return roles.includes(currentUserRole as RoleType);
  };

  const allowedNavKeys: NavKey[] = ROLE_NAV_MAP[currentUserRole as RoleKey] || [];

  const canAccessNav = (navKey: NavKey): boolean => {
    return allowedNavKeys.includes(navKey);
  };

  return {
    currentUserRole,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessNav,
    allowedNavKeys,
    isSuperAdmin,
    isAdmin,
    isStudent,
    isSuspended: isSuspended(currentUser?.id || ''),
  };
}
