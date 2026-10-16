import React, { useState } from 'react';
import { Search, ShieldCheck, Award, CheckCircle, XCircle, Calendar, Hash, ArrowLeft } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { Certificate } from '../../types';

interface VerifyCertificateProps {
  onBack: () => void;
  onViewModal: (cert: Certificate) => void;
}

export const VerifyCertificate: React.FC<VerifyCertificateProps> = ({ onBack, onViewModal }) => {
  const { verifyCertificateByHash } = useCourse();
  const [query, setQuery] = useState('9f83a218d6e3c0429188faeb2c091f37e41b9d4c');
  const [result, setResult] = useState<Certificate | null | undefined>(undefined);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const cert = verifyCertificateByHash(query);
    setResult(cert || null);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      
      <button
        onClick={onBack}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Official Credential Verification</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Verify the authenticity of any Csbox credential against our immutable registry. Enter the Certificate Number or SHA-256 cryptographic hash.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleVerify} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-700">
          Certificate Serial Number or Cryptographic Hash
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. CS-2026-CERT-90412 or SHA-256 hash..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Verify</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <span>Sample test serial:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('LS-2026-GOV-89410');
            }}
            className="text-blue-600 hover:underline font-mono cursor-pointer"
          >
            LS-2026-GOV-89410
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result !== undefined && (
        <div>
          {result ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Authentic &amp; Validated Credential</h3>
                    <p className="text-[11px] text-emerald-700 font-medium">Record matched in PostgreSQL verification table</p>
                  </div>
                </div>

                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {result.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Credential Holder</div>
                  <div className="text-slate-900 font-bold text-sm">{result.learnerName}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Course / Curriculum</div>
                  <div className="text-slate-900 font-bold">{result.courseTitle}</div>
                  <div className="text-[10px] text-slate-500">Version {result.courseVersion}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Certificate Number</div>
                  <div className="text-slate-900 font-mono font-bold">{result.certificateNumber}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Date of Issuance</div>
                  <div className="text-slate-900 font-mono">{new Date(result.issuedAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[11px] font-mono break-all space-y-1">
                <div className="text-slate-400 text-[10px] uppercase">Cryptographic SHA-256 Proof:</div>
                <div className="text-blue-400">{result.verificationHash}</div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onViewModal(result)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>View Official Certificate &amp; Print</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
              <XCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="font-bold text-red-900 text-sm">Credential Not Found</h3>
              <p className="text-xs text-red-700">
                No active certificate matching "{query}" was found in the authoritative registry. Check the hash or contact academic governance.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
