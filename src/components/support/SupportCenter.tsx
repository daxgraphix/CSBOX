import React, { useState } from 'react';
import { 
  LifeBuoy, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  ShieldAlert, 
  Plus, 
  User 
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { SupportTicket } from '../../types';

export const SupportCenter: React.FC = () => {
  const { supportTickets, replyToSupportTicket, updateTicketStatus, createSupportTicket } = useCourse();
  const { currentUser } = useAuth();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(supportTickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('academic');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('medium');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  const selectedTicket = supportTickets.find(t => t.id === selectedTicketId) || supportTickets[0];

  // Ticket statistics
  const ticketStats = {
    open: supportTickets.filter(t => t.status === 'open').length,
    resolved: supportTickets.filter(t => t.status === 'resolved').length,
    escalated: supportTickets.filter(t => t.status === 'escalated').length,
    total: supportTickets.length,
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    replyToSupportTicket(selectedTicket.id, replyText);
    setReplyText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim()) return;

    createSupportTicket({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      subject: newSubject,
      category: newCategory,
      priority: newPriority
    }, newInitialMsg);

    setShowNewTicketModal(false);
    setNewSubject('');
    setNewInitialMsg('');
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4" />
            <span>Learner Support Desk &amp; Escalation Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Support Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Triage learner academic questions, lab connectivity inquiries, and credential disputes.
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Support Ticket</span>
        </button>
      </div>

      {/* Ticket Statistics KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Open Tickets</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{ticketStats.open}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Resolved</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{ticketStats.resolved}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Escalated</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{ticketStats.escalated}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <span>Total Volume</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{ticketStats.total}</div>
        </div>
      </div>

      {/* Tickets Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Ticket List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Inquiries ({supportTickets.length})
          </div>

          <div className="space-y-2">
            {supportTickets.map(ticket => {
              const isSelected = ticket.id === selectedTicket?.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-400 uppercase">
                      #{ticket.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      ticket.status === 'escalated' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">
                    {ticket.subject}
                  </h4>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{ticket.userName}</span>
                    <span className="capitalize">{ticket.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Conversation */}
        {selectedTicket && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Ticket #{selectedTicket.id} • {selectedTicket.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Opened by {selectedTicket.userName} ({selectedTicket.userEmail})
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateTicketStatus(selectedTicket.id, 'escalated')}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Escalate
                </button>
                <button
                  onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {selectedTicket.messages.map(msg => (
                <div key={msg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{msg.senderName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({msg.senderRole})</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700">Reply to Inquiry</label>
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your response or resolution notes..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Open Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Lab environment ingress port error"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="academic">Academic &amp; Labs</option>
                    <option value="account">Account &amp; IAM</option>
                    <option value="technical">Technical Platform</option>
                    <option value="payment">Billing / Entitlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={newInitialMsg}
                  onChange={e => setNewInitialMsg(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
