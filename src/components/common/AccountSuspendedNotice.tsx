import React from 'react';
import { AlertOctagon, ShieldAlert, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccountSuspendedNotice: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser.isSuspended) return null;

  return (
    <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 text-red-900 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>
            <strong className="font-bold">Account Access Restricted:</strong> This profile is currently suspended by Governance Administration.
            {currentUser.suspensionReason && (
              <span className="ml-1 italic font-normal text-red-800">
                (Reason: "{currentUser.suspensionReason}")
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-red-700 font-medium">
          <Mail className="w-3.5 h-3.5" />
          <span>Contact: security-board@learnsphere.internal</span>
        </div>
      </div>
    </div>
  );
};
