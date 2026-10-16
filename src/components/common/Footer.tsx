import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2, Award, Terminal } from 'lucide-react';

interface FooterProps {
  onOpenZipModal: () => void;
  onVerifyClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenZipModal, onVerifyClick }) => {
  return (
    <footer className="no-print bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Csbox Cloud Academy</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Modular multi-tenant learning governance, interactive cloud terminal sandboxes, and cryptographic compliance management platform.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-700 text-emerald-400 px-2 py-0.5 rounded font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Postgres RLS Enforced
              </span>
            </div>
          </div>

          {/* Architecture & Tech Stack */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Architecture Stack</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Next.js &amp; React 19 Engine</li>
              <li>PostgreSQL 16 with RLS Policies</li>
              <li>Express API Server &amp; Auth Guards</li>
              <li>Tailwind CSS Component Architecture</li>
              <li>Append-Only Audit Trails</li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Compliance Baseline</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>ISO/IEC 42001 (AI Management)</li>
              <li>NIST SP 800-207 Zero Trust</li>
              <li>GDPR Article 22 Automated Decisions</li>
              <li>FERPA &amp; Higher-Ed Academic Integrity</li>
              <li>Cryptographic SHA-256 Credentials</li>
            </ul>
          </div>

          {/* Direct Project Code Actions */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Developer &amp; QA Vault</h4>
            <div className="space-y-2">
              <button
                onClick={onOpenZipModal}
                className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Download Full .ZIP</span>
                </span>
                <span className="text-[10px] text-blue-400 font-mono">schema + api</span>
              </button>

              <button
                onClick={onVerifyClick}
                className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Verify Credential</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">public verify</span>
              </button>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            &copy; 2026 LearnSphere Enterprise Systems Inc. All rights reserved. Built for enterprise and institutional scale.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-300">Security Architecture</span>
            <span>&bull;</span>
            <span className="hover:text-slate-300">Accessibility (WCAG 2.1 AA)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
