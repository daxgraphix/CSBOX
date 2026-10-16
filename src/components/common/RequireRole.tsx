import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleType, Permission } from '../../types';

interface RequireRoleProps {
  roles?: RoleType | RoleType[];
  permissions?: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  roles,
  permissions,
  fallback,
  children,
}) => {
  const { currentUser, hasRole, hasPermission, isSuspended } = useAuth();

  // Block suspended users entirely
  if (currentUser.isSuspended) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-red-600 font-bold">🔒</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Account Suspended</h3>
          <p className="text-slate-500 text-sm mt-2">
            Your account has been suspended. Please contact support for assistance.
          </p>
        </div>
      )
    );
  }

  // Check role requirement
  if (roles) {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    if (!hasRole(requiredRoles)) {
      return (
        fallback ?? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <span className="text-amber-600 font-bold">🚫</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Access Restricted</h3>
            <p className="text-slate-500 text-sm mt-2">
              This section requires one of the following roles: {requiredRoles.join(', ')}.
            </p>
          </div>
        )
      );
    }
  }

  // Check permission requirement
  if (permissions) {
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const missing = requiredPermissions.filter(p => !hasPermission(p));
    if (missing.length > 0) {
      return (
        fallback ?? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <span className="text-amber-600 font-bold">🔐</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Insufficient Permissions</h3>
            <p className="text-slate-500 text-sm mt-2">
              You are missing the following permissions: {missing.join(', ')}.
            </p>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
};
