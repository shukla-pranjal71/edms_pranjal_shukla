import { DocumentRequest } from '../components/DocumentRequestForm';
import { BaseDocumentRequest } from '../components/table/DocumentTableTypes';
import { convertToDocumentRequests, convertToBaseDocumentRequests } from '../utils/documentUtils';
import { isUserAssignedToDocument, handleLiveDocumentChangeRequest } from '../utils/liveDocumentUtils';
import { documentLogService } from './documentLogService';

// Generate 100 sample documents with various statuses
const generateSampleDocuments = () => {
  const departments = ['Finance', 'HR', 'IT', 'Legal', 'Marketing', 'Operations', 'R&D', 'Sales', 'Supply Chain', 'Quality Assurance', 'Safety'];
  const countries = ['UAE', 'KSA', 'OMN', 'BHR', 'EGY'];
  const documentTypes = ['SOP', 'Policy', 'Procedure', 'Work Instruction', 'Form', 'Template'];
  const statuses = ['live', 'under-review', 'approved', 'archived', 'live-cr', 'draft', 'queried'];
  const owners = [
    { id: 'owner1', name: 'Ishaq Sharif Shaikh', email: 'ishaq@company.com' },
    { id: 'owner2', name: 'Sudipto Banerjee', email: 'sudipto@company.com' },
    { id: 'owner3', name: 'John Doe', email: 'john@company.com' },
    { id: 'owner4', name: 'Jane Smith', email: 'jane@company.com' },
    { id: 'owner5', name: 'Mike Johnson', email: 'mike@company.com' }
  ];
  const reviewers = [
    { id: 'reviewer1', name: 'Arvind Gaba', email: 'arvind@company.com' },
    { id: 'reviewer2', name: 'Sarah Wilson', email: 'sarah@company.com' },
    { id: 'reviewer3', name: 'David Brown', email: 'david@company.com' },
    { id: 'reviewer4', name: 'Lisa Davis', email: 'lisa@company.com' }
  ];
  const creators = [
    { id: 'creator1', name: 'Alex Thompson', email: 'alex@company.com' },
    { id: 'creator2', name: 'Emma Wilson', email: 'emma@company.com' },
    { id: 'creator3', name: 'Ryan Miller', email: 'ryan@company.com' },
    { id: 'creator4', name: 'Sophie Anderson', email: 'sophie@company.com' }
  ];

  const sampleDocs = [];
  
  for (let i = 1; i <= 100; i++) {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
    const creator = creators[Math.floor(Math.random() * creators.length)];
    
    const uploadDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const revisionDate = new Date(uploadDate.getTime() - (Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000));
    const nextRevisionDate = new Date(uploadDate.getTime() + (Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000));
    
    sampleDocs.push({
      id: `doc-${String(i).padStart(3, '0')}`,
      sopName: `${department} ${docType} ${i}`,
      documentCode: `${department.slice(0, 3).toUpperCase()}-${docType.slice(0, 3).toUpperCase()}-2024-${String(i).padStart(3, '0')}`,
      status: status,
      department: department,
      country: country,
      versionNumber: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
      uploadDate: uploadDate.toISOString().split('T')[0],
      lastRevisionDate: revisionDate.toISOString().split('T')[0],
      nextRevisionDate: nextRevisionDate.toISOString().split('T')[0],
      documentType: docType,
      documentOwners: [owner],
      reviewers: [reviewer],
      documentCreators: [creator],
      complianceNames: [],
      isBreached: Math.random() > 0.8, // 20% chance of being breached
      comments: [
        `Document created for ${department} department`,
        `Version ${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)} uploaded`
      ],
      createdAt: uploadDate.toISOString()
    });
  }
  
  return sampleDocs;
};

// Sample documents with Live-CR status for testing
const liveCRSampleDocuments = [
  {
    id: 'live-cr-001',
    sopName: 'Quality Control Procedures',
    documentCode: 'QCP-2024-001',
    status: 'live-cr',
    department: 'Quality Assurance',
    country: 'UAE',
    versionNumber: '2.1',
    uploadDate: '2024-08-10',
    lastRevisionDate: '2024-07-15',
    nextRevisionDate: '2025-01-15',
    documentType: 'SOP',
    documentOwners: [
      { id: 'owner1', name: 'Ishaq Sharif Shaikh', email: 'ishaq@company.com' }
    ],
    reviewers: [
      { id: 'reviewer1', name: 'Sudipto Banerjee', email: 'sudipto@company.com' }
    ],
    documentCreators: [
      { id: 'creator1', name: 'Arvind Gaba', email: 'arvind@company.com' }
    ],
    complianceNames: [],
    isBreached: false,
    comments: ['Document updated with new quality standards'],
    createdAt: '2024-08-10T14:22:00Z'
  },
  {
    id: 'live-cr-002',
    sopName: 'Safety Protocol Manual',
    documentCode: 'SPM-2024-002',
    status: 'live-cr',
    department: 'Safety',
    country: 'KSA',
    versionNumber: '1.3',
    uploadDate: '2024-08-11',
    lastRevisionDate: '2024-08-01',
    nextRevisionDate: '2025-02-01',
    documentType: 'Policy',
    documentOwners: [
      { id: 'owner2', name: 'Sudipto Banerjee', email: 'sudipto@company.com' }
    ],
    reviewers: [
      { id: 'reviewer2', name: 'Arvind Gaba', email: 'arvind@company.com' }
    ],
    documentCreators: [
      { id: 'creator2', name: 'Ishaq Sharif Shaikh', email: 'ishaq@company.com' }
    ],
    complianceNames: [],
    isBreached: false,
    comments: ['Safety protocols updated for compliance'],
    createdAt: '2024-08-11T09:45:00Z'
  }
];

// Basic hardcoded documents
const basicHardcodedDocuments = [
  {
    id: 'doc-001',
    sopName: 'Financial Reporting Procedures',
    documentCode: 'FRP-2024-001',
    status: 'live',
    department: 'Finance',
    country: 'UAE',
    versionNumber: '1.0',
    uploadDate: '2024-07-15',
    lastRevisionDate: '2024-06-01',
    nextRevisionDate: '2024-12-01',
    documentType: 'SOP',
    documentOwners: [
      { id: 'owner3', name: 'John Doe', email: 'john@company.com' }
    ],
    reviewers: [
      { id: 'reviewer3', name: 'Jane Smith', email: 'jane@company.com' }
    ],
    documentCreators: [
      { id: 'creator3', name: 'Mike Johnson', email: 'mike@company.com' }
    ],
    complianceNames: [],
    isBreached: false,
    comments: [],
    createdAt: '2024-07-15T10:00:00Z'
  }
];

class DocumentService {
  private documents: DocumentRequest[] = [];

  constructor() {
    // Generate 100 sample documents and combine with existing ones
    const generatedDocs = generateSampleDocuments();
    const allDocuments = [...generatedDocs, ...liveCRSampleDocuments];
    this.documents = convertToDocumentRequests(allDocuments);
  }

  async getAllDocuments(currentUserId?: string, currentUserRole?: string): Promise<DocumentRequest[]> {
    // If user info is provided, filter documents by assignment
    if (currentUserId && currentUserRole) {
      return this.documents.filter(doc => 
        isUserAssignedToDocument(doc, currentUserId, currentUserRole)
      );
    }
    return this.documents;
  }

  async getDocumentById(id: string, currentUserId?: string, currentUserRole?: string): Promise<DocumentRequest | null> {
    const document = this.documents.find(doc => doc.id === id);
    
    if (!document) return null;
    
    // Check if user has access to this document
    if (currentUserId && currentUserRole && 
        !isUserAssignedToDocument(document, currentUserId, currentUserRole)) {
      return null;
    }
    
    return document;
  }

  async getDocumentsByStatus(status: string, currentUserId?: string, currentUserRole?: string): Promise<DocumentRequest[]> {
    let filteredDocs = this.documents.filter(doc => doc.status === status);
    
    // Apply user assignment filter
    if (currentUserId && currentUserRole) {
      filteredDocs = filteredDocs.filter(doc => 
        isUserAssignedToDocument(doc, currentUserId, currentUserRole)
      );
    }
    
    return filteredDocs;
  }

  async updateDocumentStatus(
    id: string, 
    newStatus: string, 
    options?: { pendingWith?: string; approvedBy?: string }
  ): Promise<DocumentRequest | null> {
    const docIndex = this.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return null;
    
    const currentDoc = this.documents[docIndex];
    let finalStatus = newStatus;
    
    // Handle Live to Live-CR transition when change is requested
    if (currentDoc.status === 'live' && (newStatus === 'under-review' || newStatus === 'live-cr')) {
      finalStatus = 'live-cr';
      
      // Log the status change
      await documentLogService.createDocumentLog(
        id,
        'System',
        'status_change',
        {
          newStatus: 'live-cr',
          previousStatus: 'live',
          description: 'Status changed from Live to Live-CR due to change request'
        }
      );
    }
    
    const updates: Partial<DocumentRequest> = {
      status: finalStatus as any
    };

    // Apply additional options if provided
    if (options?.pendingWith) {
      updates.pendingWith = options.pendingWith;
    }
    if (options?.approvedBy) {
      updates.comments = [
        ...(this.documents[docIndex].comments || []),
        `Approved by: ${options.approvedBy}`
      ];
    }

    this.documents[docIndex] = {
      ...this.documents[docIndex],
      ...updates
    };
    
    return this.documents[docIndex];
  }

  async createDocument(document: DocumentRequest): Promise<DocumentRequest> {
    const newDocument = {
      ...document,
      id: document.id || crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    this.documents.push(newDocument);
    return newDocument;
  }

  async updateDocument(updatedDoc: DocumentRequest): Promise<DocumentRequest | null> {
    const docIndex = this.documents.findIndex(doc => doc.id === updatedDoc.id);
    if (docIndex === -1) return null;
    
    // Handle Live to Live-CR transition
    const currentDoc = this.documents[docIndex];
    let newStatus = updatedDoc.status;
    
    if (currentDoc.status === 'live') {
      newStatus = 'live-cr' as any;
    }
    
    this.documents[docIndex] = {
      ...updatedDoc,
      status: newStatus
    };
    
    return this.documents[docIndex];
  }

  async deleteDocument(id: string): Promise<boolean> {
    const docIndex = this.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    this.documents.splice(docIndex, 1);
    return true;
  }

  async archiveDocument(id: string): Promise<boolean> {
    const docIndex = this.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    this.documents[docIndex] = {
      ...this.documents[docIndex],
      status: 'archived' as any
    };
    
    return true;
  }

  async restoreDocument(id: string): Promise<boolean> {
    const docIndex = this.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    this.documents[docIndex] = {
      ...this.documents[docIndex],
      status: 'draft' as any
    };
    
    return true;
  }

  async handleCreatorApproval(id: string, approverName: string): Promise<boolean> {
    const docIndex = this.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    this.documents[docIndex] = {
      ...this.documents[docIndex],
      status: 'approved' as any
    };
    
    return true;
  }

  async handleCreatorQuery(id: string, query: string): Promise<boolean> {
    const docIndex = this.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    this.documents[docIndex] = {
      ...this.documents[docIndex],
      status: 'queried' as any,
      comments: [...(this.documents[docIndex].comments || []), query]
    };
    
    return true;
  }

  async handleOwnerApproval(id: string, approverName: string): Promise<boolean> {
    const docIndex = this.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    this.documents[docIndex] = {
      ...this.documents[docIndex],
      status: 'approved' as any
    };
    
    return true;
  }

  // Convert to BaseDocumentRequest format
  async getAllBaseDocuments(currentUserId?: string, currentUserRole?: string): Promise<BaseDocumentRequest[]> {
    const docs = await this.getAllDocuments(currentUserId, currentUserRole);
    return convertToBaseDocumentRequests(docs);
  }
}

export const documentService = new DocumentService();
