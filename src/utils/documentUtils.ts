import { DocumentStatus as TableDocumentStatus } from '@/components/table/DocumentTableTypes';
import { DocumentStatus as FormDocumentStatus } from '@/components/DocumentRequestForm';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';
import { DocumentRequest } from '@/components/DocumentRequestForm';

// Safe document status casting - include live-cr status
export const safeDocumentStatus = (status: string): TableDocumentStatus => {
  const validStatuses: TableDocumentStatus[] = [
    'draft',
    'under-review',
    'pending-creator-approval',
    'pending-requester-approval',
    'under-revision',
    'pending-owner-approval',
    'approved',
    'rejected',
    'queried',
    'reviewed',
    'live',
    'live-cr',
    'archived',
    'deleted',
    'pending-with-requester'
  ];
  
  // Convert pending-approval to under-review
  if (status === 'pending-approval') {
    return 'under-review';
  }
  
  // Convert any invalid status to 'under-review'
  return validStatuses.includes(status as TableDocumentStatus) 
    ? (status as TableDocumentStatus) 
    : 'under-review';
};

// Helper to convert status for DocumentRequest (different enum) - include live-cr
export const safeDocumentStatusForDocumentRequest = (status: string): FormDocumentStatus => {
  // Map table statuses to DocumentRequest statuses
  const statusMapping: Record<string, FormDocumentStatus> = {
    'pending-with-requester': 'under-review',
    'reviewed': 'under-review',
    'pending-creator-approval': 'under-review',
    'pending-requester-approval': 'under-review',
    'under-revision': 'under-review',
    'pending-owner-approval': 'under-review',
    'draft': 'under-review',
    'rejected': 'under-review',
    'pending-approval': 'under-review',
    'live-cr': 'live'
  };
  
  const mappedStatus = statusMapping[status] || status;
  
  const validDocumentRequestStatuses: FormDocumentStatus[] = [
    'under-review',
    'approved',
    'queried',
    'live',
    'archived',
    'deleted'
  ];
  
  return validDocumentRequestStatuses.includes(mappedStatus as FormDocumentStatus) 
    ? (mappedStatus as FormDocumentStatus) 
    : 'under-review';
};

// Ensure a document request has all required BaseDocumentRequest fields
export const ensureBaseDocumentRequestType = (doc: any): BaseDocumentRequest => {
  return {
    id: doc.id || '',
    sopName: doc.sopName || doc.title || '',
    status: safeDocumentStatus(doc.status || 'under-review'),
    isBreached: doc.isBreached || false,
    versionNumber: doc.versionNumber || '1.0',
    uploadDate: doc.uploadDate || new Date().toISOString().split('T')[0],
    documentOwners: doc.documentOwners || [],
    reviewers: doc.reviewers || [],
    documentCreators: doc.documentCreators || [],
    complianceNames: doc.complianceNames || [],
    comments: doc.comments || [],
    // Add missing required properties for BaseDocumentRequest
    documentCode: doc.documentCode || '',
    country: doc.country || '',
    documentType: doc.documentType || 'SOP',
    lastRevisionDate: doc.lastRevisionDate || '',
    nextRevisionDate: doc.nextRevisionDate || '',
    department: doc.department || 'General',
    // Add missing optional properties
    reviewDeadline: doc.reviewDeadline,
    reviewDue: doc.reviewDue || false,
    needsReview: doc.needsReview || false,
    createdAt: doc.createdAt,
    currentReviewers: doc.currentReviewers
  };
};

// Helper to validate document workflow state - updated transitions to include live-cr
export const validateWorkflowTransition = (
  currentStatus: TableDocumentStatus, 
  targetStatus: TableDocumentStatus
): boolean => {
  const validTransitions: Record<TableDocumentStatus, TableDocumentStatus[]> = {
    'draft': ['under-review'],
    'under-review': ['pending-creator-approval', 'queried', 'approved'],
    'pending-creator-approval': ['pending-requester-approval', 'under-review'],
    'pending-requester-approval': ['under-revision', 'pending-creator-approval'],
    'under-revision': ['pending-owner-approval'],
    'pending-owner-approval': ['approved', 'under-revision'],
    'approved': ['live'],
    'live': ['under-review', 'live-cr'],
    'live-cr': ['live', 'under-review'],
    'queried': ['under-review'],
    'reviewed': ['under-review'],
    'archived': ['under-review'],
    'deleted': ['under-review'],
    'rejected': ['under-review'],
    'pending-with-requester': ['under-review']
  };
  
  return validTransitions[currentStatus]?.includes(targetStatus) || false;
};

// Helper to get next workflow step description - updated descriptions to include live-cr
export const getWorkflowStepDescription = (status: TableDocumentStatus): string => {
  const descriptions: Record<TableDocumentStatus, string> = {
    'draft': 'Document is in draft state',
    'under-review': 'Document is for review',
    'pending-creator-approval': 'Awaiting Document Creator approval',
    'pending-requester-approval': 'Awaiting Document Requester approval',
    'under-revision': 'Document Owner needs to upload revised version',
    'pending-owner-approval': 'Awaiting Document Owner approval',
    'approved': 'Document approved, awaiting Controller to push live',
    'live': 'Document is live and published',
    'live-cr': 'Live document with change request in progress',
    'queried': 'Query needs to be resolved',
    'reviewed': 'Document has been reviewed',
    'archived': 'Document archived',
    'deleted': 'Document deleted',
    'rejected': 'Document rejected',
    'pending-with-requester': 'Pending with requester'
  };
  
  return descriptions[status] || 'Unknown workflow state';
};

// Helper to determine who can take action on a document - updated actions to include live-cr
export const getActionableRoles = (status: TableDocumentStatus): string[] => {
  const roleMap: Record<TableDocumentStatus, string[]> = {
    'draft': ['Document Creator'],
    'under-review': ['Document Creator', 'Document Requester', 'Reviewers'],
    'pending-creator-approval': ['Document Creator'],
    'pending-requester-approval': ['Document Requester'],
    'under-revision': ['Document Owner'],
    'pending-owner-approval': ['Document Owner'],
    'approved': ['Document Controller'],
    'live': ['Document Controller'],
    'live-cr': ['Document Controller', 'Document Owner'],
    'queried': ['Document Requester', 'Document Owner'],
    'reviewed': ['Document Controller'],
    'archived': ['Document Controller'],
    'deleted': ['Document Controller'],
    'rejected': ['Document Creator'],
    'pending-with-requester': ['Document Requester']
  };
  
  return roleMap[status] || [];
};

// Convert DocumentRequest to BaseDocumentRequest
export const convertDocumentRequestToBase = (doc: DocumentRequest): BaseDocumentRequest => {
  return ensureBaseDocumentRequestType({
    ...doc,
    createdAt: doc.createdAt || new Date().toISOString(),
    uploadDate: doc.uploadDate || new Date().toISOString().split('T')[0],
    department: doc.department || 'General'
  });
};

// Convert array of DocumentRequest to BaseDocumentRequest[]
export const convertToBaseDocumentRequests = (docs: DocumentRequest[]): BaseDocumentRequest[] => {
  return docs.map(doc => convertDocumentRequestToBase(doc));
};

// Legacy alias for backward compatibility
export const ensureDocumentRequestType = ensureBaseDocumentRequestType;

// Convert documents from various formats to DocumentRequest format
export const convertToDocumentRequests = (docs: any[]): DocumentRequest[] => {
  return docs.map(doc => ({
    id: doc.id || crypto.randomUUID(),
    sopName: doc.sopName || doc.title || 'Untitled Document',
    status: safeDocumentStatusForDocumentRequest(doc.status || 'under-review'), // Fix: Use proper conversion function
    department: doc.department || 'General',
    isBreached: !!doc.isBreached,
    createdAt: doc.createdAt || new Date().toISOString(),
    documentOwners: doc.documentOwners || [],
    reviewers: doc.reviewers || [],
    documentCreators: doc.documentCreators || [],
    complianceNames: doc.complianceNames || [],
    documentCode: doc.documentCode || '',
    documentNumber: doc.documentNumber || '',
    versionNumber: doc.versionNumber || '1.0',
    uploadDate: doc.uploadDate || new Date().toISOString().split('T')[0],
    comments: doc.comments || [],
    country: doc.country || '',
    lastRevisionDate: doc.lastRevisionDate || '',
    nextRevisionDate: doc.nextRevisionDate || '',
    documentType: doc.documentType || 'SOP',
    complianceContacts: doc.complianceContacts || []
  }));
};

// Alias for extended documents conversion (same as convertToBaseDocumentRequests)
export const convertExtendedDocumentsToBase = convertToBaseDocumentRequests;
