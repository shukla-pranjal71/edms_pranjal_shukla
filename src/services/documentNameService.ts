
import { documentNames } from '@/data/hardcodedData';

export interface DocumentName {
  id: string;
  name: string;
  department: string;
  document_type: string;
  created_at?: string;
}

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export const documentNameService = {
  // Get all document names
  async getAllDocumentNames(): Promise<DocumentName[]> {
    await simulateDelay();
    console.log('Returning hardcoded document names:', documentNames);
    return [...documentNames];
  },

  // Get document names by department
  async getDocumentNamesByDepartment(department: string): Promise<DocumentName[]> {
    await simulateDelay();
    const filtered = documentNames.filter(dn => dn.department === department);
    console.log('Filtered document names by department:', filtered);
    return filtered;
  },

  // Get document names by document type
  async getDocumentNamesByType(documentType: string): Promise<DocumentName[]> {
    await simulateDelay();
    const filtered = documentNames.filter(dn => dn.document_type === documentType);
    console.log('Filtered document names by type:', filtered);
    return filtered;
  },

  // Get filtered document names by department and document type
  async getFilteredDocumentNames(department?: string, documentType?: string): Promise<DocumentName[]> {
    await simulateDelay();
    let filtered = [...documentNames];
    
    if (department) {
      filtered = filtered.filter(dn => dn.department === department);
    }
    
    if (documentType) {
      filtered = filtered.filter(dn => dn.document_type === documentType);
    }
    
    console.log('Filtered document names:', filtered);
    return filtered;
  },

  // Create a new document name
  async createDocumentName(name: string, department: string, documentType: string): Promise<DocumentName | null> {
    await simulateDelay();
    
    const newDocumentName: DocumentName = {
      id: (documentNames.length + 1).toString(),
      name: name.trim(),
      department: department.trim(),
      document_type: documentType.trim(),
      created_at: new Date().toISOString()
    };
    
    const hardcodedDocumentName = {
      id: newDocumentName.id,
      name: newDocumentName.name,
      department: newDocumentName.department,
      document_type: newDocumentName.document_type,
      created_at: newDocumentName.created_at || new Date().toISOString()
    };
    
    documentNames.push(hardcodedDocumentName);
    console.log('Created new document name:', newDocumentName);
    return newDocumentName;
  },

  // Update an existing document name
  async updateDocumentName(id: string, updates: { name: string; department: string; document_type: string }): Promise<DocumentName | null> {
    await simulateDelay();
    
    const docNameIndex = documentNames.findIndex(dn => dn.id === id);
    if (docNameIndex !== -1) {
      documentNames[docNameIndex].name = updates.name.trim();
      documentNames[docNameIndex].department = updates.department.trim();
      documentNames[docNameIndex].document_type = updates.document_type.trim();
      console.log('Updated document name:', documentNames[docNameIndex]);
      return {
        id: documentNames[docNameIndex].id,
        name: documentNames[docNameIndex].name,
        department: documentNames[docNameIndex].department,
        document_type: documentNames[docNameIndex].document_type,
        created_at: documentNames[docNameIndex].created_at
      };
    }
    return null;
  },

  // Delete a document name
  async deleteDocumentName(id: string): Promise<boolean> {
    await simulateDelay();
    
    const docNameIndex = documentNames.findIndex(dn => dn.id === id);
    if (docNameIndex !== -1) {
      const deletedDocName = documentNames.splice(docNameIndex, 1)[0];
      console.log('Deleted document name:', deletedDocName);
      return true;
    }
    return false;
  }
};
