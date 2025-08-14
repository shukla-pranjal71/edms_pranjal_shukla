
import { DocumentStatus } from '@/components/table/DocumentTableTypes';

/**
 * Handles the transition of a Live document to Live-CR when a change request is initiated
 */
export const handleLiveDocumentChangeRequest = (currentStatus: DocumentStatus): DocumentStatus => {
  if (currentStatus === 'live') {
    return 'live-cr';
  }
  return currentStatus;
};

/**
 * Handles the completion of a change request for a Live-CR document
 */
export const handleLiveCRCompletion = (currentStatus: DocumentStatus, approved: boolean): DocumentStatus => {
  if (currentStatus === 'live-cr') {
    return approved ? 'live' : 'live';
  }
  return currentStatus;
};

/**
 * Checks if a document can have a change request initiated
 */
export const canInitiateChangeRequest = (status: DocumentStatus): boolean => {
  return status === 'live';
};

/**
 * Automatically updates document status to Live-CR when changes are made to a Live document
 */
export const handleDocumentEdit = (currentStatus: DocumentStatus): DocumentStatus => {
  if (currentStatus === 'live') {
    return 'live-cr';
  }
  return currentStatus;
};

/**
 * Checks if a user is assigned to a document (document visibility control)
 */
export const isUserAssignedToDocument = (
  document: any, 
  currentUserId: string, 
  currentUserRole: string
): boolean => {
  // Admin and document controllers can see all documents
  if (currentUserRole === 'admin' || currentUserRole === 'document-controller') {
    return true;
  }

  // Check if user is in any of the assigned roles for this document
  const assignedUsers = [
    ...(document.documentOwners || []),
    ...(document.reviewers || []),
    ...(document.documentCreators || []),
    ...(document.complianceNames || []),
    ...(document.currentReviewers || [])
  ];

  return assignedUsers.some(user => 
    (typeof user === 'string' && user === currentUserId) ||
    (typeof user === 'object' && user.id === currentUserId)
  );
};
