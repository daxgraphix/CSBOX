/**
 * CertificateRegistry - Shared component for displaying certificate lists.
 *
 * Eliminates the 3x duplication that existed in App.tsx for student, admin,
 * and super_admin certificate registries.
 *
 * Props:
 *   certificates - Array of certificates to display
 *   showLearnerName - Whether to show the learner name column (admin/super_admin)
 *   onInspect - Callback when a certificate is inspected
 *   variant - Visual variant: 'student' | 'admin' | 'super_admin'
 *   pageSize - Number of items per page (default: 10)
 */

import React, { memo, useState } from 'react';
import { Certificate } from '../../types';

interface CertificateRegistryProps {
  certificates: Certificate[];
  showLearnerName?: boolean;
  onInspect: (cert: Certificate) => void;
  variant?: 'student' | 'admin' | 'super_admin';
  pageSize?: number;
}

const VARIANT_CONFIG: Record<string, { title: string; subtitle: string; badgeColor: string }> = {
  student: {
    title: 'My Earned Academic Credentials',
    subtitle: 'Official certificates verified through cryptographic SHA-256 signatures.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  admin: {
    title: 'Academic Certificates Registry',
    subtitle: 'All issued credentials on the authoritative registry.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  super_admin: {
    title: 'Enterprise Credentials Governance',
    subtitle: 'Inspect, verify, or revoke issued credentials.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

const CertificateRegistryInner: React.FC<CertificateRegistryProps> = ({
  certificates,
  showLearnerName = false,
  onInspect,
  variant = 'admin',
  pageSize = 10,
}) => {
  const config = VARIANT_CONFIG[variant];
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(certificates.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCerts = certificates.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{config.title}</h2>
            <p className="text-xs text-slate-500">{config.subtitle}</p>
          </div>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${config.badgeColor}`}>
            {certificates.length} Total Issued
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedCerts.map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5 truncate min-w-0">
                <div className="font-bold text-slate-900 truncate">{cert.courseTitle}</div>
                <div className="text-slate-500 font-mono">No: {cert.certificateNumber}</div>
                {showLearnerName && (
                  <div className="text-slate-400 text-[11px]">Learner: {cert.learnerName}</div>
                )}
                <div className="text-slate-400 text-[10px]">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => onInspect(cert)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
              >
                Inspect
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CertificateRegistry = memo(CertificateRegistryInner);
