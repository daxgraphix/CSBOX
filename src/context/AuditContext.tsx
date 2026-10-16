import React, { createContext, useContext, useState } from 'react';
import { AuditLog, RoleType } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data/mockData';

interface AuditContextType {
  logs: AuditLog[];
  logEvent: (event: {
    actorId: string;
    actorName: string;
    actorRole: RoleType;
    action: string;
    entityType: AuditLog['entityType'];
    entityId: string;
    details: string;
    severity?: 'info' | 'warning' | 'critical';
  }) => void;
  filterLogs: (query: { entityType?: string; severity?: string; actorRole?: string; search?: string }) => AuditLog[];
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const logEvent = (event: {
    actorId: string;
    actorName: string;
    actorRole: RoleType;
    action: string;
    entityType: AuditLog['entityType'];
    entityId: string;
    details: string;
    severity?: 'info' | 'warning' | 'critical';
  }) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: event.actorId,
      actorName: event.actorName,
      actorRole: event.actorRole,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      details: event.details,
      ipAddress: '192.168.1.' + (10 + Math.floor(Math.random() * 80)),
      severity: event.severity || 'info',
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const filterLogs = (query: { entityType?: string; severity?: string; actorRole?: string; search?: string }) => {
    return logs.filter(log => {
      if (query.entityType && query.entityType !== 'all' && log.entityType !== query.entityType) {
        return false;
      }
      if (query.severity && query.severity !== 'all' && log.severity !== query.severity) {
        return false;
      }
      if (query.actorRole && query.actorRole !== 'all' && log.actorRole !== query.actorRole) {
        return false;
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        const matches = 
          log.action.toLowerCase().includes(s) ||
          log.actorName.toLowerCase().includes(s) ||
          log.details.toLowerCase().includes(s) ||
          log.entityId.toLowerCase().includes(s);
        if (!matches) return false;
      }
      return true;
    });
  };

  return (
    <AuditContext.Provider value={{ logs, logEvent, filterLogs }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
