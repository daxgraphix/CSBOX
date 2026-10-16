import React, { useState } from 'react';
import { 
  Webhook, 
  Send, 
  CheckCircle, 
  Server, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw,
  Layers,
  Database,
  Cloud,
  Plus,
  Trash2,
  Lock,
  Folder,
  FileCode,
  FileText,
  Download,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string;
  scope: 'full_admin' | 'course_read' | 'grading_write' | 'webhooks_only';
  createdAt: string;
  expiresAt: string;
  lastUsed: string;
}

interface CloudFile {
  name: string;
  bucket: string;
  size: string;
  updatedAt: string;
  type: string;
}

export const IntegrationsView: React.FC = () => {
  // Webhook State
  const [webhookUrl, setWebhookUrl] = useState('https://enterprise.internal.corp/api/v1/csbox-events');
  const [selectedEvent, setSelectedEvent] = useState('certificate.issued');
  const [sendingTest, setSendingTest] = useState(false);
  const [lastResponse, setLastResponse] = useState<{ 
    status: number; 
    statusText: string;
    durationMs: number;
    message: string; 
    timestamp: string; 
    hmacSignature: string;
    payload: any 
  } | null>(null);

  // API Keys state
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key_prod_01',
      name: 'Production LMS Connector',
      keyPrefix: 'csbox_live_9942a',
      fullKey: 'csbox_live_sec_9942a0b18f7c9e0d112b84e',
      scope: 'full_admin',
      createdAt: '2026-10-01',
      expiresAt: '2027-10-01',
      lastUsed: '4 minutes ago'
    },
    {
      id: 'key_audit_02',
      name: 'Security Information Event Sync (SIEM)',
      keyPrefix: 'csbox_live_4118c',
      fullKey: 'csbox_live_sec_4118ce287b309fca8817da3',
      scope: 'webhooks_only',
      createdAt: '2026-09-15',
      expiresAt: '2027-03-15',
      lastUsed: '1 hour ago'
    }
  ]);

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<ApiKeyItem['scope']>('full_admin');

  // Simulated Cloud Object Storage state
  const [activeBucket, setActiveBucket] = useState<'assets' | 'submissions' | 'backups'>('assets');
  const [cloudFiles] = useState<Record<string, CloudFile[]>>({
    assets: [
      { name: 'zero-trust-calico-topology.svg', bucket: 'csbox-production-assets', size: '240 KB', updatedAt: '2026-10-14', type: 'image/svg+xml' },
      { name: 'lecture-01-kernel-bypass.mp4', bucket: 'csbox-production-assets', size: '142 MB', updatedAt: '2026-10-12', type: 'video/mp4' },
      { name: 'kubernetes-cni-cheatsheet.pdf', bucket: 'csbox-production-assets', size: '1.2 MB', updatedAt: '2026-10-10', type: 'application/pdf' },
    ],
    submissions: [
      { name: 'alex-miller-architecture-audit.pdf', bucket: 'csbox-student-capstones', size: '3.4 MB', updatedAt: '2026-10-15', type: 'application/pdf' },
      { name: 'james-chen-raft-consensus-impl.zip', bucket: 'csbox-student-capstones', size: '4.8 MB', updatedAt: '2026-10-14', type: 'application/zip' },
    ],
    backups: [
      { name: 'csbox-pgdump-20261015-000000.sql.gz', bucket: 'csbox-pgdump-backups', size: '89.4 MB', updatedAt: '2026-10-15 00:00:00 UTC', type: 'application/gzip' },
      { name: 'csbox-audit-archive-2026-q3.json', bucket: 'csbox-pgdump-backups', size: '14.1 MB', updatedAt: '2026-10-01', type: 'application/json' },
    ]
  });

  // Third-party notification ping status
  const [connectorStatus, setConnectorStatus] = useState<string | null>(null);

  const handleSendTestWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);

    const eventPayload = {
      event: selectedEvent,
      timestamp: new Date().toISOString(),
      eventId: `evt_${Date.now()}`,
      environment: 'production',
      platform: 'Csbox Cloud Academy v2.0',
      data: selectedEvent === 'certificate.issued' ? {
        certificateNumber: 'CS-2026-CERT-90412',
        learnerEmail: 'alex.miller@gmail.com',
        courseTitle: 'Network Security & Zero Trust Architecture',
        verificationHash: '9f83a218d6e3c0429188faeb2c091f37e41b9d4c82b992f0212ab00a9ecb8821',
        issuedAt: new Date().toISOString(),
        status: 'valid'
      } : selectedEvent === 'quiz.graded' ? {
        studentId: 'usr_student_1',
        quizTitle: 'Policy Decision & Enforcement Points',
        score: 100,
        passingThreshold: 70,
        result: 'PASSED'
      } : {
        studentId: 'usr_student_1',
        courseId: 'crs_sec_01',
        enrolledAt: new Date().toISOString()
      }
    };

    const simulatedHmac = 'sha256=4f2a71b9c910243e882a170b991c0e34bcf129482910fae19039a8820c71bf29';

    setTimeout(() => {
      setSendingTest(false);
      setLastResponse({
        status: 200,
        statusText: 'OK',
        durationMs: 84,
        message: 'HTTP 200 OK — Remote listener verified X-Csbox-Signature HMAC header',
        timestamp: new Date().toISOString(),
        hmacSignature: simulatedHmac,
        payload: eventPayload
      });
    }, 650);
  };

  const handleCopyKey = (keyItem: ApiKeyItem) => {
    navigator.clipboard.writeText(keyItem.fullKey);
    setCopiedKeyId(keyItem.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const full = `csbox_live_sec_${randomSuffix}${Date.now().toString(36)}`;
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: full.substring(0, 16),
      fullKey: full,
      scope: newKeyScope,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: '2027-10-15',
      lastUsed: 'Never'
    };

    setKeys([newKey, ...keys]);
    setNewKeyName('');
    setShowNewKeyModal(false);
  };

  const handleDeleteKey = (keyId: string) => {
    setKeys(keys.filter(k => k.id !== keyId));
  };

  const handleTriggerConnector = (serviceName: string) => {
    setConnectorStatus(`Dispatched test event to ${serviceName} webhook URL. (HTTP 200 Verified)`);
    setTimeout(() => setConnectorStatus(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Webhooks, Cloud APIs &amp; Integrations</h1>
        <p className="text-xs text-slate-500">
          Connect Csbox real-time event streams with external SIEM, Canvas LMS, GitHub Classroom, and Cloud Storage.
        </p>
      </div>

      {connectorStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {connectorStatus}
          </span>
          <button onClick={() => setConnectorStatus(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Grid: Webhook Dispatcher & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Outgoing Webhook Trigger */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Outgoing Webhook Dispatcher Simulator</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
              Active v2.0
            </span>
          </div>

          <form onSubmit={handleSendTestWebhook} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Webhook Target Endpoint URL (HTTPS)
              </label>
              <input
                type="url"
                required
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/webhooks"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Event Trigger to Simulate
                </label>
                <select
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono cursor-pointer"
                >
                  <option value="certificate.issued">certificate.issued (Verifiable Credential)</option>
                  <option value="student.enrolled">student.enrolled (New Enrollment)</option>
                  <option value="quiz.graded">quiz.graded (Assessment Evaluated)</option>
                  <option value="course.published">course.published (Curriculum Released)</option>
                  <option value="user.suspended">user.suspended (Security Suspension)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  HMAC Signature Header
                </label>
                <input
                  type="text"
                  readOnly
                  value="X-Csbox-Signature: sha256=..."
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Payload signed with HMAC SHA-256 header: <code className="text-slate-600">X-Csbox-Signature</code>
              </span>
              <button
                type="submit"
                disabled={sendingTest}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingTest ? 'Dispatching...' : 'Send Live Test Ping'}</span>
              </button>
            </div>
          </form>

          {/* Response Inspector */}
          {lastResponse && (
            <div className="bg-slate-900 rounded-xl p-4 text-slate-200 text-xs font-mono space-y-3 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {lastResponse.message} ({lastResponse.durationMs}ms)
                </span>
                <span className="text-slate-400">{new Date(lastResponse.timestamp).toLocaleTimeString()}</span>
              </div>

              <div className="text-[10px] text-slate-400 space-y-0.5 border-b border-slate-800 pb-2">
                <div><strong>Digest:</strong> <span className="text-amber-300 font-mono">{lastResponse.hmacSignature}</span></div>
                <div><strong>Remote Endpoint:</strong> {webhookUrl}</div>
              </div>

              <pre className="text-[11px] overflow-x-auto text-emerald-300/90 leading-relaxed whitespace-pre-wrap max-h-56">
                {JSON.stringify(lastResponse.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Col: Cloud Services & LTI Sync */}
        <div className="space-y-6">
          
          {/* Third-Party Service Connectors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Third-Party Alert Connectors</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Trigger real-time incident notifications and enrollment webhooks to external team channels.
            </p>

            <div className="space-y-2 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Slack Security Ops</div>
                  <div className="text-[10px] text-slate-500 font-mono">#csbox-audit-alerts</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerConnector('Slack (#csbox-audit-alerts)')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold cursor-pointer shadow-2xs"
                >
                  Test Ping
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Discord Classroom Bot</div>
                  <div className="text-[10px] text-slate-500 font-mono">#lab-submissions</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerConnector('Discord (#lab-submissions)')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold cursor-pointer shadow-2xs"
                >
                  Test Ping
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">GitHub Classroom Sync</div>
                  <div className="text-[10px] text-slate-500 font-mono">org: csbox-cloud-academy</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerConnector('GitHub Classroom')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold cursor-pointer shadow-2xs"
                >
                  Test Sync
                </button>
              </div>
            </div>
          </div>

          {/* Cloud Infrastructure Readiness */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cloud className="w-4 h-4 text-teal-600" />
              <span>Cloud Services &amp; SCORM / LTI</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Object Storage (PDF &amp; Media)</span>
                <span className="text-emerald-700 font-bold font-mono">Connected (S3/GCS)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">LTI 1.3 / SCORM 2004</span>
                <span className="text-blue-700 font-bold font-mono">Ready (LMS Sync)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Video CDN Edge Nodes</span>
                <span className="text-emerald-700 font-bold font-mono">100% Operational</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Scoped API Keys Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Scoped Production API Keys</h2>
            </div>
            <p className="text-xs text-slate-500">
              Generate and rotate bearer tokens for backend integrations and automated lab runners.
            </p>
          </div>

          <button
            onClick={() => setShowNewKeyModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Key Label</th>
                <th className="py-2.5">Prefix / Value</th>
                <th className="py-2.5">Scope</th>
                <th className="py-2.5">Expires</th>
                <th className="py-2.5">Last Activity</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {keys.map(k => (
                <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-sans font-bold text-slate-800">{k.name}</td>
                  <td className="py-3 text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {k.keyPrefix}••••••••
                    </span>
                  </td>
                  <td className="py-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      k.scope === 'full_admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {k.scope.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 font-sans">{k.expiresAt}</td>
                  <td className="py-3 text-slate-500 font-sans">{k.lastUsed}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 font-sans">
                      <button
                        onClick={() => handleCopyKey(k)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Copy Secret Key"
                      >
                        {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKeyId === k.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Storage Sandbox Bucket Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Cloud Storage Bucket Explorer (S3 / GCS)</h2>
            </div>
            <p className="text-xs text-slate-500">
              Browse uploaded course curricula assets, student lab attachments, and encrypted database snapshots.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setActiveBucket('assets')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeBucket === 'assets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Course Assets
            </button>
            <button
              onClick={() => setActiveBucket('submissions')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeBucket === 'submissions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Capstones
            </button>
            <button
              onClick={() => setActiveBucket('backups')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeBucket === 'backups' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Database Snapshots
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Object Key</th>
                <th className="py-2.5">Bucket</th>
                <th className="py-2.5">Size</th>
                <th className="py-2.5">MIME Type</th>
                <th className="py-2.5">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {cloudFiles[activeBucket].map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-sans font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{f.name}</span>
                  </td>
                  <td className="py-3 text-slate-500">{f.bucket}</td>
                  <td className="py-3 text-slate-700">{f.size}</td>
                  <td className="py-3 text-slate-500">{f.type}</td>
                  <td className="py-3 text-slate-500 font-sans">{f.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Generate Scoped API Key</h3>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Label / Service Name
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g. Canvas Sync Worker or Automated CI Grader"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Access Scope
                </label>
                <select
                  value={newKeyScope}
                  onChange={e => setNewKeyScope(e.target.value as ApiKeyItem['scope'])}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                >
                  <option value="full_admin">Full Administrator (Read / Write / Delete)</option>
                  <option value="grading_write">Grading &amp; Assessment Engine (Submit / Score)</option>
                  <option value="course_read">Course Catalog Read-Only</option>
                  <option value="webhooks_only">Webhook Events Only</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewKeyModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
