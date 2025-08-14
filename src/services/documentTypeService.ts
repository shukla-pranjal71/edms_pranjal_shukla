
import { documentTypes } from '@/data/hardcodedData';

export interface DocumentType {
  id: number;
  name: string;
  department?: string;
  created_at?: string;
}

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export const documentTypeService = {
  // Get all document types
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    await simulateDelay();
    console.log('Returning hardcoded document types:', documentTypes);
    return [...documentTypes];
  },

  // Create a new document type
  async createDocumentType(name: string, department: string): Promise<DocumentType | null> {
    await simulateDelay();
    
    const newDocumentType: DocumentType = {
      id: Math.max(...documentTypes.map(dt => dt.id)) + 1,
      name: name.trim(),
      department: department.trim(),
      created_at: new Date().toISOString()
    };
    
    // Ensure the new document type has required properties for the hardcoded data array
    const hardcodedDocumentType = {
      id: newDocumentType.id,
      name: newDocumentType.name,
      department: newDocumentType.department || "General",
      created_at: newDocumentType.created_at || new Date().toISOString()
    };
    
    documentTypes.push(hardcodedDocumentType);
    console.log('Created new document type:', newDocumentType);
    return newDocumentType;
  },

  // Update an existing document type
  async updateDocumentType(id: number, name: string, department: string): Promise<DocumentType | null> {
    await simulateDelay();
    
    const docTypeIndex = documentTypes.findIndex(dt => dt.id === id);
    if (docTypeIndex !== -1) {
      documentTypes[docTypeIndex].name = name.trim();
      documentTypes[docTypeIndex].department = department.trim();
      console.log('Updated document type:', documentTypes[docTypeIndex]);
      return {
        id: documentTypes[docTypeIndex].id,
        name: documentTypes[docTypeIndex].name,
        department: documentTypes[docTypeIndex].department,
        created_at: documentTypes[docTypeIndex].created_at
      };
    }
    return null;
  },

  // Delete a document type
  async deleteDocumentType(id: number): Promise<boolean> {
    await simulateDelay();
    
    const docTypeIndex = documentTypes.findIndex(dt => dt.id === id);
    if (docTypeIndex !== -1) {
      const deletedDocType = documentTypes.splice(docTypeIndex, 1)[0];
      console.log('Deleted document type:', deletedDocType);
      return true;
    }
    return false;
  }
};
