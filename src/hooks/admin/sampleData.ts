
import { safeDocumentStatus } from '@/utils/documentUtils';
import { ExtendedDocumentRequest } from './useAdminDashboardState';
import { Person } from '@/components/PeopleField';
import { DocumentType } from '@/components/table/DocumentTableTypes';
import { createEmptyDocument } from '@/utils/documentGenerationUtils';
import { v4 as uuidv4 } from 'uuid';

// Create a minimal empty document for testing - no sample data
export const createSampleDocument = (): ExtendedDocumentRequest => {
  const baseDoc = createEmptyDocument();
  
  return {
    ...baseDoc,
    sopName: '',
    documentCode: '',
    documentNumber: '',
    country: '',
    department: '',
    documentType: 'SOP' as DocumentType,
    documentOwners: [],
    reviewers: [],
    status: safeDocumentStatus('under-review'),
    uploadDate: new Date().toISOString().split('T')[0], // Ensure uploadDate is always present
    isBreached: false, // Add required isBreached property
  };
};

// Export empty array - no sample documents
export const sampleDocuments: ExtendedDocumentRequest[] = [];
