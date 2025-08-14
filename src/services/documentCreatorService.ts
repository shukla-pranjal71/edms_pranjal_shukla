
import { BaseDocumentRequest } from "@/components/table/DocumentTableTypes";
import { documents } from '@/data/hardcodedData';

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

// Helper function to ensure document request type
const ensureDocumentRequestType = (doc: any): BaseDocumentRequest => {
  return {
    ...doc,
    documentOwners: Array.isArray(doc.documentOwners) ? doc.documentOwners : [],
    reviewers: Array.isArray(doc.reviewers) ? doc.reviewers : [],
    documentCreators: Array.isArray(doc.documentCreators) ? doc.documentCreators : [],
    complianceNames: Array.isArray(doc.complianceNames) ? doc.complianceNames : [],
  };
};

export const documentCreatorService = {
  // Get documents for document creator
  async getCreatorDocuments(): Promise<BaseDocumentRequest[]> {
    await simulateDelay();
    
    const activeDocuments = documents.filter(doc => 
      doc.status !== "archived" && doc.status !== "deleted"
    );
    
    console.log('Returning creator documents:', activeDocuments);
    return activeDocuments.map(doc => ensureDocumentRequestType(doc));
  },
  
  // Get document statistics for document creator
  async getCreatorDocumentStats() {
    await simulateDelay();
    
    const activeDocuments = documents.filter(doc => 
      doc.status !== "archived" && doc.status !== "deleted"
    ).map(doc => ensureDocumentRequestType(doc));
    
    const stats = {
      draft: activeDocuments.filter(doc => doc.status === 'draft').length,
      underReview: activeDocuments.filter(doc => doc.status === 'under-review').length,
      underRevision: activeDocuments.filter(doc => doc.status === 'under-revision').length,
      approved: activeDocuments.filter(doc => doc.status === 'approved').length,
      breached: activeDocuments.filter(doc => doc.isBreached === true).length,
    };
    
    console.log('Creator document stats:', stats);
    return stats;
  },
  
  // Start document review process
  async startDocumentReview(documentId: string): Promise<boolean> {
    await simulateDelay();
    
    const docIndex = documents.findIndex(doc => doc.id === documentId);
    if (docIndex !== -1) {
      documents[docIndex] = {
        ...documents[docIndex],
        status: "under-review"
      };
      
      console.log('Started document review for:', documentId);
      return true;
    }
    
    return false;
  }
};
