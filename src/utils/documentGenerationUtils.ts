import { v4 as uuidv4 } from 'uuid';
import { DocumentRequest, DocumentStatus } from '@/components/DocumentRequestForm';
import { Person } from '@/components/PeopleField';

// Generate document code in the format: SDG-<First 3 letters of Department>-<Document Type>-01-<Language>
export const generateDocumentCode = (department: string, documentType: string, language?: string): string => {
  // Get first 3 letters of department, uppercase
  const deptCode = department.substring(0, 3).toUpperCase();
  
  // Map document types to their abbreviations
  const typeAbbreviations: { [key: string]: string } = {
    'SOP': 'SOP',
    'Policy': 'POL',
    'Work Instruction': 'WI',
    'Form': 'FOR',
    'Template': 'TEM',
    'Guideline': 'GUI'
  };
  
  const typeCode = typeAbbreviations[documentType] || documentType.substring(0, 3).toUpperCase();
  
  // Map language to abbreviation
  const languageCode = language === 'Arabic' ? 'AR' : 'EN';
  
  return `SDG-${deptCode}-${typeCode}-01-${languageCode}`;
};

// Helper function to get a random date within a range
export const getRandomDate = (start: Date, end: Date): string => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

// Helper function to ensure document status is valid
export const getValidDocumentStatus = (status: string | undefined): DocumentStatus => {
  const validStatuses: DocumentStatus[] = [
    'draft',
    'under-review',
    'approved', 
    'reviewed', 
    'live', 
    'archived', 
    'deleted',
    'queried',
    'pending-with-requester'
  ];
  
  if (status && validStatuses.includes(status as DocumentStatus)) {
    return status as DocumentStatus;
  }
  
  return 'under-review';
};

// Create a sample document for new instances
export const createEmptyDocument = (): DocumentRequest => {
  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);
  
  return {
    id: uuidv4(),
    sopName: '',
    documentCode: '',
    documentNumber: '',
    country: '',
    lastRevisionDate: now.toISOString().split('T')[0],
    nextRevisionDate: nextYear.toISOString().split('T')[0],
    versionNumber: '1.0',
    status: 'under-review',
    uploadDate: now.toISOString().split('T')[0],
    documentOwners: [],
    reviewers: [],
    complianceNames: [],
    complianceContacts: [],
    documentCreators: [],
    createdAt: now.toISOString(),
    documentType: 'SOP',
    department: '',
    comments: []
  };
};

// Helper to generate sample people data when needed
export const generateSamplePerson = (): Person => {
  return {
    id: uuidv4(),
    name: 'Sample Person',
    email: 'sample@example.com'
  };
};

// Helper to ensure required fields for BaseDocumentRequest
export const ensureRequiredDocumentFields = (document: Partial<DocumentRequest>): DocumentRequest => {
  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);
  
  const department = document.department || 'General';
  const documentType = document.documentType || 'SOP';
  
  return {
    id: document.id || uuidv4(),
    sopName: document.sopName || 'Untitled Document',
    documentCode: document.documentCode || generateDocumentCode(department, documentType),
    documentNumber: document.documentNumber || '',
    country: document.country || '',
    lastRevisionDate: document.lastRevisionDate || now.toISOString().split('T')[0],
    nextRevisionDate: document.nextRevisionDate || nextYear.toISOString().split('T')[0],
    versionNumber: document.versionNumber || '1.0',
    status: getValidDocumentStatus(document.status),
    uploadDate: document.uploadDate || now.toISOString().split('T')[0],
    documentOwners: document.documentOwners || [],
    reviewers: document.reviewers || [],
    complianceNames: document.complianceNames || [],
    complianceContacts: document.complianceContacts || [],
    documentCreators: document.documentCreators || [],
    comments: document.comments || [],
    createdAt: document.createdAt || now.toISOString(),
    documentType: documentType,
    department: department
  };
};
