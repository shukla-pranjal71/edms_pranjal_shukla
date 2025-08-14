
/// <reference types="vite/client" />

import { Person } from './components/PeopleField';
import { DocumentStatus as TableDocumentStatus, DocumentType } from './components/table/DocumentTableTypes';
import { DocumentStatus as FormDocumentStatus } from './components/DocumentRequestForm';
import { ChangeRequestStatus as ChangeFormRequestStatus } from './components/ChangeRequestForm';

declare global {
  // Updated Person type compatibility
  type ComplianceNameType = Person;
  
  // Add compatibility between different DocumentStatus types
  type DocumentStatusType = TableDocumentStatus | FormDocumentStatus;
  
  // Add DocumentType as a global type
  type DocumentTypeGlobal = DocumentType;
  
  // Add a ChangeRequestStatus type for better type safety
  type ChangeRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';
  
  // Extend the ChangeRequest interface to include attachmentUrl
  interface ChangeRequestExtensions {
    attachmentUrl?: string;
    attachmentName?: string;
  }
}
