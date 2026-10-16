import React, { useState } from 'react';
import { Download, FileCode, Check, Copy, Folder, Database, Server, Shield, Layers, FileText } from 'lucide-react';
import { 
  generateProjectZip, 
  downloadBlobAsFile, 
  GENERATED_BACKEND_SCHEMA_SQL, 
  GENERATED_BACKEND_SERVER_TS, 
  GENERATED_DOCKER_COMPOSE, 
  GENERATED_DOCKERFILE, 
  GENERATED_README_MD 
} from '../../services/zipExporter';

interface ProjectZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectZipModal: React.FC<ProjectZipModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('schema.sql');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const fileMap: Record<string, { label: string; icon: any; content: string; lang: string }> = {
    'schema.sql': {
      label: 'schema.sql (PostgreSQL DDL & RLS)',
      icon: Database,
      content: GENERATED_BACKEND_SCHEMA_SQL,
      lang: 'sql'
    },
    'server/index.ts': {
      label: 'server/index.ts (Express & RBAC API)',
      icon: Server,
      content: GENERATED_BACKEND_SERVER_TS,
      lang: 'typescript'
    },
    'docker-compose.yml': {
      label: 'docker-compose.yml (Postgres & API)',
      icon: Layers,
      content: GENERATED_DOCKER_COMPOSE,
      lang: 'yaml'
    },
    'Dockerfile': {
      label: 'Dockerfile (Multi-Stage Build)',
      icon: FileCode,
      content: GENERATED_DOCKERFILE,
      lang: 'dockerfile'
    },
    'README.md': {
      label: 'README.md (Architecture & Verification)',
      icon: FileText,
      content: GENERATED_README_MD,
      lang: 'markdown'
    }
  };

  const currentFile = fileMap[selectedFile];

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await generateProjectZip();
      downloadBlobAsFile(blob, 'csbox-enterprise-platform.zip');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Csbox Full-Stack Source Code &amp; Architecture</h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                  Ready to Export .ZIP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete production repository: PostgreSQL DDL + RLS, Express Backend, Next.js/React architecture, Docker &amp; docs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Compiling .ZIP Archive...' : 'Download Full Project (.zip)'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 text-sm font-semibold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content split */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File sidebar */}
          <div className="w-72 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2 overflow-y-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Project Files
            </div>
            {Object.entries(fileMap).map(([filename, item]) => {
              const Icon = item.icon;
              const isActive = selectedFile === filename;
              return (
                <button
                  key={filename}
                  onClick={() => setSelectedFile(filename)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <div className="mt-auto pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Production Security Highlights</span>
              </div>
              <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-1">
                <li>PostgreSQL RLS with row-level policies</li>
                <li>Server-side answer key protection</li>
                <li>Audit trail append-only logs</li>
                <li>SHA-256 certificate hashing</li>
              </ul>
            </div>
          </div>

          {/* File Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                {selectedFile}
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-300">
              <pre className="whitespace-pre-wrap">{currentFile.content}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Format: Standard ZIP Archive with root <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-800">schema.sql</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-800">docker-compose.yml</code>, and <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-800">server/</code> directory.
          </div>
          <button
            onClick={handleDownload}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download ZIP
          </button>
        </div>

      </div>
    </div>
  );
};
