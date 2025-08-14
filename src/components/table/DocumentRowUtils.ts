
import { BaseDocumentRequest } from './DocumentTableTypes';

export const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return "—";
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return "—";
  }
};

export const getPendingWith = (doc: BaseDocumentRequest): string => {
  if (!doc) return "—";
  
  // Check if document has explicit pendingWith field first
  if ((doc as any).pendingWith) {
    return (doc as any).pendingWith;
  }
  
  // Fallback to status-based logic for under-review status
  switch (doc.status) {
    case 'draft':
      return 'Document Creator';
    case 'under-review':
      // For under-review, it could be pending with either reviewers or document creator
      // Check if there are reviewers assigned
      if (doc.reviewers && doc.reviewers.length > 0) {
        return 'Reviewers';
      } else {
        return 'Document Creator';
      }
    case 'under-revision':
      return 'Document Owner';
    case 'pending-creator-approval':
      return 'Document Creator';
    case 'pending-requester-approval':
      return 'Document Requester';
    case 'pending-owner-approval':
      return 'Document Owner';
    case 'approved':
      return 'Complete';
    case 'rejected':
      return 'Document Creator';
    case 'queried':
      return 'Document Controller';
    default:
      return "—";
  }
};

export const getDocumentCode = (doc: BaseDocumentRequest): string => {
  if (!doc) return "—";
  return doc.documentCode || doc.id?.substring(0, 8) || "—";
};

export const getVersionNumber = (doc: BaseDocumentRequest): string => {
  if (!doc) return "1.0";
  return doc.versionNumber || "1.0";
};

export const getFormattedOwners = (doc: BaseDocumentRequest): string => {
  if (!doc || !doc.documentOwners || doc.documentOwners.length === 0) {
    return "Not Assigned";
  }
  
  if (doc.documentOwners.length === 1) {
    return doc.documentOwners[0].name;
  }
  
  return `${doc.documentOwners[0].name} +${doc.documentOwners.length - 1} more`;
};

export const getCountryDisplay = (doc: BaseDocumentRequest): string => {
  if (!doc || !doc.country) return "—";
  return doc.country;
};

export const formatTableDate = (dateString: string | undefined): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "—";
  }
};

// Get department display with fallback
export const getDepartmentDisplay = (doc: BaseDocumentRequest): string => {
  if (!doc) return "—";
  
  // Check various possible department field names
  const department = (doc as any).department || 
                    (doc as any).departmentName || 
                    (doc as any).dept || 
                    'Not Specified';
  
  return department;
};

// Get document type display with fallback
export const getDocumentTypeDisplay = (doc: BaseDocumentRequest): string => {
  if (!doc) return "SOP";
  
  const docType = (doc as any).documentType || 
                  (doc as any).type || 
                  'SOP';
  
  return docType;
};

// Get requester name with fallback
export const getRequesterDisplay = (doc: BaseDocumentRequest): string => {
  if (!doc) return "—";
  
  const requester = (doc as any).requester || 
                   (doc as any).requestedBy || 
                   (doc as any).createdBy;
  
  if (typeof requester === 'string') {
    return requester;
  } else if (requester && requester.name) {
    return requester.name;
  }
  
  return "Not Specified";
};
