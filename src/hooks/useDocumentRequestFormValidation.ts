
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { Person } from '@/components/PeopleField';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateDocumentRequest = (document: DocumentRequest, attachment?: File | null, isDocumentCreator?: boolean): ValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (!document.sopName?.trim()) {
    errors.push('Document name is required');
  }

  if (!document.documentType) {
    errors.push('Document type is required');
  }

  if (!document.department?.trim()) {
    errors.push('Department is required');
  }

  if (!document.country?.trim()) {
    errors.push('Country is required');
  }

  if (!document.documentCode?.trim()) {
    errors.push('Document code is required');
  } else if (!document.documentCode.startsWith('SDG')) {
    errors.push('Document code must start with "SDG"');
  }

  if (!document.versionNumber?.trim()) {
    errors.push('Version number is required');
  }

  // Date validation
  if (!document.lastRevisionDate) {
    errors.push('Last revision date is required');
  }

  if (!document.nextRevisionDate) {
    errors.push('Next revision date is required');
  }

  // Validate date logic
  if (document.lastRevisionDate && document.nextRevisionDate) {
    const lastDate = new Date(document.lastRevisionDate);
    const nextDate = new Date(document.nextRevisionDate);
    
    if (nextDate <= lastDate) {
      errors.push('Next revision date must be after last revision date');
    }
  }

  // People field validation
  if (!document.documentOwners || document.documentOwners.length === 0) {
    errors.push('At least one document owner is required');
  }

  if (!document.documentCreators || document.documentCreators.length === 0) {
    errors.push('At least one document creator is required');
  }

  // Attachment validation for non-document creators
  if (!isDocumentCreator && !attachment) {
    errors.push('Document attachment is required');
  }

  // Validate people objects
  const validatePeople = (people: Person[], fieldName: string) => {
    people.forEach((person, index) => {
      if (!person.name?.trim()) {
        errors.push(`${fieldName} ${index + 1}: Name is required`);
      }
      if (!person.email?.trim()) {
        errors.push(`${fieldName} ${index + 1}: Email is required`);
      }
      if (person.email && !isValidEmail(person.email)) {
        errors.push(`${fieldName} ${index + 1}: Invalid email format`);
      }
    });
  };

  validatePeople(document.documentOwners || [], 'Document Owner');
  validatePeople(document.documentCreators || [], 'Document Creator');
  validatePeople(document.reviewers || [], 'Reviewer');
  validatePeople(document.complianceNames || [], 'Compliance Contact');

  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const ensureCompleteDocumentFields = (document: Partial<DocumentRequest>): DocumentRequest => {
  const currentDate = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const nextYearDate = nextYear.toISOString().split('T')[0];

  return {
    id: document.id || crypto.randomUUID(),
    sopName: document.sopName?.trim() || '',
    documentCode: document.documentCode?.trim() || '',
    documentNumber: document.documentNumber?.trim() || '',
    country: document.country?.trim() || '',
    lastRevisionDate: document.lastRevisionDate || currentDate,
    nextRevisionDate: document.nextRevisionDate || nextYearDate,
    versionNumber: document.versionNumber?.trim() || '1.0',
    status: document.status || 'under-review',
    uploadDate: document.uploadDate || currentDate,
    documentOwners: document.documentOwners || [],
    reviewers: document.reviewers || [],
    complianceNames: document.complianceNames || [],
    documentCreators: document.documentCreators || [],
    complianceContacts: document.complianceContacts || [],
    comments: document.comments || [],
    needsReview: document.needsReview || false,
    reviewDue: document.reviewDue || false,
    isBreached: document.isBreached || false,
    attachmentName: document.attachmentName,
    documentType: document.documentType || 'SOP',
    department: document.department?.trim() || '',
    reviewStartDate: document.reviewStartDate,
    reviewDeadline: document.reviewDeadline,
    documentUrl: document.documentUrl,
    fileUrl: document.fileUrl,
    createdAt: document.createdAt || new Date().toISOString(),
    description: document.description?.trim() || '',
    effectiveDate: document.effectiveDate,
    pendingWith: document.pendingWith
  };
};
