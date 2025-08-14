export type DocumentStatus = 
  | 'draft'
  | 'under-review'
  | 'pending-creator-approval'
  | 'pending-requester-approval'
  | 'under-revision'
  | 'pending-owner-approval'
  | 'approved'
  | 'rejected'
  | 'live'
  | 'live-cr'
  | 'archived'
  | 'deleted'
  | 'queried'
  | 'reviewed'
  | 'pending-with-requester';

export type UserRole = 
  | 'admin'
  | 'document-controller'
  | 'document-creator'
  | 'requester'
  | 'document-requester'
  | 'reviewer'
  | 'document-owner';

export type DocumentType = 'SOP' | 'Policy' | 'Procedure' | 'Work Instruction' | 'Form' | 'Guideline';

export interface Person {
  id: string;
  name: string;
  email: string;
}

export interface BaseDocumentRequest {
  id: string;
  documentCode: string;
  sopName: string;
  versionNumber: string;
  uploadDate: string;
  department: string;
  status: DocumentStatus;
  documentOwners: Person[];
  reviewers: Person[];
  documentCreators: Person[];
  complianceNames: Person[];
  country: string;
  isBreached: boolean;
  comments?: string[];
  documentType?: DocumentType;
  documentNumber?: string;
  lastRevisionDate?: string;
  nextRevisionDate?: string;
  fileUrl?: string;
  documentUrl?: string;
  description?: string;
  currentReviewers?: Person[];
  createdAt?: string;
  reviewDeadline?: string;
  reviewDue?: boolean;
  needsReview?: boolean;
  pendingWith?: string;
}

export type SortDirection = 'asc' | 'desc';
