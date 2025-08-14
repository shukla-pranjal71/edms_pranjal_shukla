
import { Person } from '@/components/table/DocumentTableTypes';
import { Json } from '@/integrations/supabase/types';
import { BaseDocumentRequest, DocumentType } from '@/components/table/DocumentTableTypes';
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { ensureRequiredDocumentFields } from '@/utils/documentGenerationUtils';
import { safeDocumentStatus } from '@/utils/documentUtils';

// Helper function to safely parse JSON arrays to Person objects
export const safeParsePerson = (jsonData: Json | null): Person[] => {
  if (!jsonData) return [];
  
  // If already an array of Person objects, return as is
  if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object') {
    try {
      // Validate that it has the Person structure
      return jsonData.map(item => {
        if (typeof item === 'object' && item !== null && 'name' in item && 'email' in item) {
          return {
            name: String(item.name || ''),
            email: String(item.email || ''),
            id: String(item.id || Date.now())
          };
        }
        // Return a default Person if structure is invalid
        return { name: 'Unknown', email: '', id: String(Date.now()) };
      });
    } catch (error) {
      console.error('Error parsing person data:', error);
      return [];
    }
  }
  
  // Return empty array for invalid data
  return [];
};

// Helper function to convert Person[] to a JSON-serializable format for Supabase
export const convertPersonArrayToJson = (persons: Person[]): Json => {
  // This converts the Person[] array to a plain object array that Supabase can handle
  if (!Array.isArray(persons)) return [];
  return persons.map(person => ({
    id: person.id,
    name: person.name,
    email: person.email
  })) as Json;
};

// Helper function to convert DocumentRequest array to BaseDocumentRequest array
export const convertDocumentsToBaseFormat = (documents: DocumentRequest[]): BaseDocumentRequest[] => {
  return documents.map(doc => {
    // Ensure all required fields are present
    const completeDoc = ensureRequiredDocumentFields(doc);
    
    // Convert to BaseDocumentRequest by explicitly mapping fields
    return {
      id: completeDoc.id,
      sopName: completeDoc.sopName,
      documentCode: completeDoc.documentCode,
      documentNumber: completeDoc.documentNumber,
      country: completeDoc.country,
      lastRevisionDate: completeDoc.lastRevisionDate,
      nextRevisionDate: completeDoc.nextRevisionDate,
      versionNumber: completeDoc.versionNumber,
      status: safeDocumentStatus(completeDoc.status),
      uploadDate: completeDoc.uploadDate || new Date().toISOString().split('T')[0], 
      documentOwners: completeDoc.documentOwners.map(owner => ({
        id: owner.id || String(Date.now()),
        name: owner.name,
        email: owner.email
      })),
      reviewers: completeDoc.reviewers.map(reviewer => ({
        id: reviewer.id || String(Date.now()),
        name: reviewer.name,
        email: reviewer.email
      })),
      complianceNames: completeDoc.complianceNames.map(comp => ({
        id: comp.id || String(Date.now()),
        name: comp.name,
        email: comp.email
      })),
      documentCreators: completeDoc.documentCreators.map(creator => ({
        id: creator.id || String(Date.now()),
        name: creator.name,
        email: creator.email
      })),
      createdAt: completeDoc.createdAt,
      isBreached: completeDoc.isBreached,
      comments: completeDoc.comments || [],
      documentType: completeDoc.documentType || 'SOP' as DocumentType,
      department: completeDoc.department || 'General'
    };
  });
};

// Helper function to map database document to app document
export const mapDatabaseDocumentToAppDocument = (dbDoc: any): DocumentRequest => {
  return {
    id: dbDoc.id || crypto.randomUUID(),
    sopName: dbDoc.title || 'Untitled Document',
    status: safeDocumentStatus(dbDoc.status || 'draft') as any,
    department: 'General',
    isBreached: !!dbDoc.is_breached,
    createdAt: dbDoc.created_at || new Date().toISOString(),
    documentOwners: safeParsePerson(dbDoc.document_owners).map(p => ({
      ...p,
      id: p.id || String(Date.now())
    })) || [],
    reviewers: safeParsePerson(dbDoc.reviewers).map(p => ({
      ...p, 
      id: p.id || String(Date.now())
    })) || [],
    documentCreators: safeParsePerson(dbDoc.document_creators).map(p => ({
      ...p,
      id: p.id || String(Date.now())
    })) || [],
    complianceNames: safeParsePerson(dbDoc.compliance_names).map(p => ({
      ...p,
      id: p.id || String(Date.now())
    })) || [],
    documentCode: '',
    documentNumber: '',
    versionNumber: '1.0',
    uploadDate: new Date().toISOString().split('T')[0],
    comments: [],
    country: '',
    lastRevisionDate: '',
    nextRevisionDate: '',
    documentType: 'SOP' as DocumentType,
    complianceContacts: []
  };
};

// Helper function to map app document to database document
export const mapAppDocumentToDatabaseDocument = (appDoc: DocumentRequest | BaseDocumentRequest): any => {
  return {
    title: appDoc.sopName,
    status: appDoc.status,
    is_breached: appDoc.isBreached,
    document_owners: convertPersonArrayToJson(appDoc.documentOwners),
    reviewers: convertPersonArrayToJson(appDoc.reviewers),
    document_creators: convertPersonArrayToJson(appDoc.documentCreators),
    compliance_names: convertPersonArrayToJson(appDoc.complianceNames)
  };
};
