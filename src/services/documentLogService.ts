import { documentLogs } from '@/data/hardcodedData';

// Define the DocumentLog interface
export interface DocumentLog {
  id: string;
  documentId: string;
  timestamp: string;
  user: string;
  action: string;
  details: any;
}

// Enhanced sample logs with the requested entries
const sampleLogs: DocumentLog[] = [
  // Live-CR document logs
  {
    id: 'log-001',
    documentId: 'live-cr-001',
    timestamp: '2025-08-10T14:22:00Z',
    user: 'Ishaq Sharif Shaikh',
    action: 'edit',
    details: { documentName: 'Quality Control Procedures', changes: 'Document edited by Ishaq Sharif Shaikh' }
  },
  {
    id: 'log-002',
    documentId: 'live-cr-001',
    timestamp: '2025-08-11T09:45:00Z',
    user: 'System',
    action: 'status_change',
    details: { newStatus: 'live-cr', previousStatus: 'live', description: 'Status changed from Live to Live-CR' }
  },
  {
    id: 'log-003',
    documentId: 'live-cr-001',
    timestamp: '2025-08-12T16:30:00Z',
    user: 'Admin',
    action: 'reassign',
    details: { assignedTo: 'Sudipto Banerjee', description: 'Document reassigned to Sudipto Banerjee' }
  },
  {
    id: 'log-004',
    documentId: 'live-cr-001',
    timestamp: '2025-08-13T10:05:00Z',
    user: 'Arvind Gaba',
    action: 'comment',
    details: { comment: 'Document review completed', description: 'Comment added by Arvind Gaba' }
  },
  // Second Live-CR document logs
  {
    id: 'log-005',
    documentId: 'live-cr-002',
    timestamp: '2025-08-10T11:30:00Z',
    user: 'Sudipto Banerjee',
    action: 'edit',
    details: { documentName: 'Safety Protocol Manual', changes: 'Document edited by Sudipto Banerjee' }
  },
  {
    id: 'log-006',
    documentId: 'live-cr-002',
    timestamp: '2025-08-11T14:15:00Z',
    user: 'System',
    action: 'status_change',
    details: { newStatus: 'live-cr', previousStatus: 'live', description: 'Status changed from Live to Live-CR' }
  },
  {
    id: 'log-007',
    documentId: 'live-cr-002',
    timestamp: '2025-08-12T08:20:00Z',
    user: 'Arvind Gaba',
    action: 'comment',
    details: { comment: 'Safety compliance verified', description: 'Comment added by Arvind Gaba' }
  },
  // Additional sample logs for better coverage
  {
    id: 'log-008',
    documentId: 'doc-001',
    timestamp: '2025-08-13T15:00:00Z',
    user: 'John Doe',
    action: 'create',
    details: { documentName: 'Financial Reporting Procedures', documentCode: 'FRP-2024-001', description: 'Document created' }
  },
  {
    id: 'log-009',
    documentId: 'doc-001',
    timestamp: '2025-08-13T15:30:00Z',
    user: 'Jane Smith',
    action: 'review',
    details: { reviewComments: 'Financial procedures look comprehensive', description: 'Review completed by Jane Smith' }
  },
  {
    id: 'log-010',
    documentId: 'doc-001',
    timestamp: '2025-08-13T16:00:00Z',
    user: 'Mike Johnson',
    action: 'approve',
    details: { approver: 'Mike Johnson', description: 'Document approved by Mike Johnson' }
  },
  // Existing sample logs for other documents
  {
    id: '1',
    documentId: 'DOC001',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'John Smith',
    action: 'create',
    details: { documentName: 'Safety Protocol v1.0', documentCode: 'SP-001' }
  },
  {
    id: '2',
    documentId: 'DOC001',
    timestamp: '2024-01-16T14:20:00Z',
    user: 'Sarah Johnson',
    action: 'status_change',
    details: { newStatus: 'under-review', previousStatus: 'draft' }
  },
  {
    id: '3',
    documentId: 'DOC001',
    timestamp: '2024-01-17T09:15:00Z',
    user: 'Mike Wilson',
    action: 'review',
    details: { reviewComments: 'Document looks good, minor formatting changes needed' }
  },
  {
    id: '4',
    documentId: 'DOC001',
    timestamp: '2024-01-18T11:45:00Z',
    user: 'Emily Davis',
    action: 'update',
    details: { documentName: 'Safety Protocol v1.1', changes: 'Updated formatting and sections 2-4' }
  },
  {
    id: '5',
    documentId: 'DOC001',
    timestamp: '2024-01-19T16:30:00Z',
    user: 'Alex Brown',
    action: 'status_change',
    details: { newStatus: 'approved', previousStatus: 'under-review' }
  },
  {
    id: '6',
    documentId: 'DOC002',
    timestamp: '2024-01-20T08:00:00Z',
    user: 'Lisa Chen',
    action: 'create',
    details: { documentName: 'HR Policy Manual', documentCode: 'HR-001' }
  },
  {
    id: '7',
    documentId: 'DOC002',
    timestamp: '2024-01-21T13:25:00Z',
    user: 'David Park',
    action: 'query',
    details: { remarks: 'Need clarification on section 3.2 regarding leave policies' }
  },
  {
    id: '8',
    documentId: 'DOC001',
    timestamp: '2024-01-22T10:00:00Z',
    user: 'John Smith',
    action: 'status_change',
    details: { newStatus: 'live', previousStatus: 'approved' }
  }
];

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

// Define a service type for TypeScript
export interface DocumentLogService {
  getDocumentLogs: (documentId: string) => Promise<DocumentLog[]>;
  createDocumentLog: (documentId: string, userId: string, action: string, details: any) => Promise<boolean>;
  logDocumentAction: (documentId: string, action: string, details: any) => Promise<boolean>;
  addDocumentLog: (logData: { documentId: string; action: string; details: any; }) => Promise<boolean>;
}

export const documentLogService: DocumentLogService = {
  // Get document logs for a specific document
  async getDocumentLogs(documentId: string): Promise<DocumentLog[]> {
    await simulateDelay();
    
    // Combine hardcoded logs with sample logs
    const allLogs = [...documentLogs, ...sampleLogs];
    const logs = allLogs.filter(log => log.documentId === documentId);
    console.log('Returning document logs for document:', documentId, logs);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Create a new log entry for a document
  async createDocumentLog(
    documentId: string,
    userId: string,
    action: string,
    details: any
  ): Promise<boolean> {
    await simulateDelay();
    
    const newLog: DocumentLog = {
      id: Date.now().toString(),
      documentId,
      timestamp: new Date().toISOString(),
      user: userId,
      action,
      details
    };
    
    documentLogs.push(newLog);
    console.log('Created new document log:', newLog);
    return true;
  },
  
  // Log document action (alias for createDocumentLog with different parameter order)
  async logDocumentAction(
    documentId: string,
    action: string,
    details: any
  ): Promise<boolean> {
    const userId = details.userRole || 'system';
    return this.createDocumentLog(documentId, userId, action, details);
  },

  // Add document log with different signature (for backward compatibility)
  async addDocumentLog(logData: { 
    documentId: string;
    action: string;
    details: any;
  }): Promise<boolean> {
    return this.logDocumentAction(
      logData.documentId,
      logData.action,
      logData.details
    );
  }
};
