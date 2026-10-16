import React from 'react';
import { Award, ShieldCheck, Printer, CheckCircle, ExternalLink, Calendar, Hash, UserCheck } from 'lucide-react';
import { Certificate } from '../../types';

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, isOpen, onClose }) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-8">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Official Verifiable Academic Credential</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-sm font-semibold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-8 sm:p-12 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 relative">
          
          {/* Border Frame */}
          <div className="border-4 border-double border-amber-700/60 p-8 sm:p-12 rounded-xl relative bg-white/80 shadow-inner">
            
            {/* Watermark / Seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award className="w-96 h-96 text-amber-900" />
            </div>

            {/* Header / Crest */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-lg mx-auto mb-2 border-2 border-amber-200">
                <Award className="w-9 h-9" />
              </div>
              <div className="text-xs uppercase tracking-[0.3em] font-extrabold text-amber-900">
                Csbox Cloud Computing &amp; Computer Science Consortium
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                Certificate of Academic Achievement
              </h1>
              <p className="text-xs text-slate-500 italic">
                This verified credential confirms that the candidate has satisfied all curriculum requirements, continuous assessments, and practical capstones.
              </p>
            </div>

            {/* Recipient */}
            <div className="my-8 text-center space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Presented To</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-950 underline decoration-amber-500/60 underline-offset-8">
                {certificate.learnerName}
              </div>
            </div>

            {/* Course Title */}
            <div className="text-center space-y-2 mb-10">
              <div className="text-xs text-slate-500">for successfully mastering the enterprise curriculum</div>
              <div className="text-lg sm:text-xl font-bold text-slate-800 max-w-2xl mx-auto">
                {certificate.courseTitle}
              </div>
              <div className="inline-block text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono font-medium border border-slate-200">
                Curriculum Version {certificate.courseVersion} • Validated
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 items-end text-center">
              
              <div className="space-y-1">
                <div className="font-serif italic text-base text-slate-800 border-b border-slate-300 pb-1 mx-4">
                  {certificate.issuerName}
                </div>
                <div className="text-[11px] font-semibold text-slate-600">{certificate.issuerTitle}</div>
                <div className="text-[10px] text-slate-400">Governance & Academic Integrity</div>
              </div>

              {/* Cryptographic Badge */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-600/50 flex flex-col items-center justify-center p-2 bg-amber-50/50">
                  <ShieldCheck className="w-7 h-7 text-amber-700" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-amber-800 mt-1">Verified</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">
                  Status: <span className="text-emerald-700 font-bold uppercase">{certificate.status}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-serif italic text-base text-slate-800 border-b border-slate-300 pb-1 mx-4">
                  Prof. Elena Rostova, CISSP
                </div>
                <div className="text-[11px] font-semibold text-slate-600">Chair of Instruction & Defense</div>
                <div className="text-[10px] text-slate-400">Lead Faculty Evaluator</div>
              </div>

            </div>

            {/* Cryptographic Footprint */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 font-mono">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Certificate No: <strong className="text-slate-700">{certificate.certificateNumber}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</span>
              </div>
              <div className="truncate max-w-[240px] text-right text-[10px]" title={certificate.verificationHash}>
                Proof: {certificate.verificationHash.substring(0, 16)}...
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
