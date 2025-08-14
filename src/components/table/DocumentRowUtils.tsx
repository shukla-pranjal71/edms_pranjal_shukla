
import React from 'react';
import { BaseDocumentRequest } from './DocumentTableTypes';
import { Badge } from "@/components/ui/badge";

// Format timestamp for display
export const formatTimestamp = (dateString: string) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return "—";
  }
};

// Generate document code in the format: SDG-<First 3 letters of Department>-<Document Type>-01
export const generateDocumentCode = (department: string, documentType: string): string => {
  // Get first 3 letters of department, uppercase
  const deptCode = department?.substring(0, 3).toUpperCase() || 'GEN';
  
  // Map document types to their abbreviations
  const typeAbbreviations: { [key: string]: string } = {
    'SOP': 'SOP',
    'Policy': 'POL',
    'Work Instruction': 'WI',
    'Form': 'FOR',
    'Template': 'TEM',
    'Guideline': 'GUI'
  };
  
  const typeCode = typeAbbreviations[documentType] || documentType?.substring(0, 3).toUpperCase() || 'DOC';
  
  return `SDG-${deptCode}-${typeCode}-01`;
};

// Determine who the document is pending with based on status
export const getPendingWith = (doc: BaseDocumentRequest) => {
  if (!doc) return "—";
  
  switch (doc.status) {
    case 'draft':
      return 'Document Creator';
    case 'under-review':
      if (doc.currentReviewers && doc.currentReviewers.length > 0) {
        return doc.currentReviewers.length === 1 
          ? `${doc.currentReviewers[0].name} (Reviewer)`
          : `${doc.currentReviewers[0].name} +${doc.currentReviewers.length - 1} more (Reviewers)`;
      } else if (doc.reviewers && doc.reviewers.length > 0) {
        return doc.reviewers.length === 1 
          ? `${doc.reviewers[0].name} (Reviewer)`
          : `${doc.reviewers[0].name} +${doc.reviewers.length - 1} more (Reviewers)`;
      } else {
        return 'Awaiting Reviewer Assignment';
      }
    case 'pending-approval':
    case 'pending-owner-approval':
      if (doc.documentOwners && doc.documentOwners.length > 0) {
        return doc.documentOwners.length === 1 
          ? `${doc.documentOwners[0].name} (Document Owner)`
          : `${doc.documentOwners[0].name} +${doc.documentOwners.length - 1} more (Owners)`;
      } else {
        return 'Awaiting Owner Assignment';
      }
    case 'pending-creator-approval':
      return 'Document Creator';
    case 'pending-requester-approval':
      return 'Document Requester';
    case 'approved':
      return 'Document Controller';
    case 'live':
      return 'In Production';
    case 'live-cr':
      return 'Change Request in Progress';
    case 'queried':
      return 'Requestor Action Required';
    case 'rejected':
      return 'Document Creator';
    case 'archived':
      return 'Archived';
    default:
      return 'System';
  }
};

// Show document code with fallback to generated code
export const getDocumentCode = (doc: BaseDocumentRequest): string => {
  if (!doc) return "—";
  
  if (doc.documentCode && doc.documentCode.trim() !== '') {
    return doc.documentCode;
  }
  
  // Generate document code using available data
  const department = (doc as any).department || 'General';
  const documentType = (doc as any).documentType || 'SOP';
  return generateDocumentCode(department, documentType);
};

// Show exact version or generate default
export const getVersionNumber = (doc: BaseDocumentRequest): string => {
  if (!doc) return "1.0";
  
  if (doc.versionNumber && doc.versionNumber.trim() !== '') {
    return doc.versionNumber;
  }
  return '1.0';
};

// Get formatted owners list
export const getFormattedOwners = (doc: BaseDocumentRequest): string => {
  if (!doc || !doc.documentOwners || doc.documentOwners.length === 0) {
    return 'Not Assigned';
  }
  
  if (doc.documentOwners.length === 1) {
    return doc.documentOwners[0].name;
  }
  
  return `${doc.documentOwners[0].name} +${doc.documentOwners.length - 1} more`;
};

// Show exact country or indicate when not specified
export const getCountryDisplay = (doc: BaseDocumentRequest): string => {
  if (!doc || !doc.country || doc.country.trim() === '') {
    return 'Not Specified';
  }
  return doc.country;
};

// Format date for table display with fallback dates
export const formatTableDate = (dateString: string | undefined): string => {
  if (!dateString || dateString.trim() === '') {
    return "—";
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "—";
    }
    
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
