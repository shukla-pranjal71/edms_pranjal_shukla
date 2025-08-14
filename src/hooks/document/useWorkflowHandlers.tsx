
import { Dispatch, SetStateAction } from 'react';
import { DocumentRequest } from '../../components/DocumentRequestForm';
import { AdminConfig } from '../../components/AdminConfigDialog';
import { BaseDocumentRequest } from '../../components/table/DocumentTableTypes';
import { useToast } from '@/hooks/use-toast';

interface UseWorkflowHandlersProps {
  documents: DocumentRequest[];
  setDocuments: Dispatch<SetStateAction<DocumentRequest[]>>;
  selectedDocument: DocumentRequest | null;
  setSelectedDocument: Dispatch<SetStateAction<DocumentRequest | null>>;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>; // Add this property
  setIsReviewPromptOpen: Dispatch<SetStateAction<boolean>>;
  setIsReviewerSelectionOpen: Dispatch<SetStateAction<boolean>>;
  setIsReviewUploadOpen: Dispatch<SetStateAction<boolean>>;
  adminConfig: AdminConfig;
  setIsApprovalDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsDocumentApprovalOpen: Dispatch<SetStateAction<boolean>>;
}

export const useWorkflowHandlers = ({
  documents,
  setDocuments,
  selectedDocument,
  setSelectedDocument,
  setIsFormOpen,
  setIsReviewPromptOpen,
  setIsReviewerSelectionOpen,
  setIsReviewUploadOpen,
  adminConfig,
  setIsApprovalDialogOpen,
  setIsDocumentApprovalOpen,
}: UseWorkflowHandlersProps) => {
  const { toast } = useToast();

  const updateDocumentStatus = async (documentId: string, newStatus: string) => {
    try {
      const updatedDocuments = documents.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: newStatus as any }
          : doc
      );
      setDocuments(updatedDocuments);
      
      toast({
        title: "Status Updated",
        description: `Document status updated to ${newStatus}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive"
      });
    }
  };

  const handleReviewDocument = async () => {
    if (!selectedDocument) return;
    setIsReviewPromptOpen(true);
  };

  const handleUploadRevised = async () => {
    if (!selectedDocument) return;
    setIsReviewUploadOpen(true);
  };

  const handlePushToLive = async () => {
    if (!selectedDocument) return;
    await updateDocumentStatus(selectedDocument.id, 'live');
  };

  const handleAddDocument = async (newDocument: DocumentRequest) => {
    try {
      setDocuments(prev => [...prev, newDocument]);
      setIsFormOpen(false);
      
      toast({
        title: "Document Added",
        description: "New document has been successfully added",
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive"
      });
    }
  };

  const handleStartReview = async () => {
    if (!selectedDocument) return;
    setIsReviewerSelectionOpen(true);
  };

  const handleSelectReviewers = async (reviewers: any[]) => {
    if (!selectedDocument) return;
    
    try {
      const updatedDocument = {
        ...selectedDocument,
        reviewers,
        status: 'under-review' as any
      };
      
      const updatedDocuments = documents.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      );
      
      setDocuments(updatedDocuments);
      setSelectedDocument(updatedDocument);
      setIsReviewerSelectionOpen(false);
      
      toast({
        title: "Reviewers Selected",
        description: "Document has been sent for review",
        variant: "default"
      });
    } catch (error) {
      console.error('Error selecting reviewers:', error);
      toast({
        title: "Error",
        description: "Failed to select reviewers",
        variant: "destructive"
      });
    }
  };

  const handleUploadDocument = async (file: File) => {
    try {
      // Simulate file upload
      console.log('Uploading file:', file.name);
      
      toast({
        title: "Document Uploaded",
        description: "Document has been successfully uploaded",
        variant: "default"
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    }
  };

  const handleApproveDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      await updateDocumentStatus(selectedDocument.id, 'approved');
      setIsApprovalDialogOpen(false);
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleRejectDocument = async (reason: string) => {
    if (!selectedDocument) return;
    
    try {
      const updatedDocument = {
        ...selectedDocument,
        status: 'under-review' as any,
        comments: [...(selectedDocument.comments || []), `Rejected: ${reason}`]
      };
      
      const updatedDocuments = documents.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      );
      
      setDocuments(updatedDocuments);
      setSelectedDocument(updatedDocument);
      setIsApprovalDialogOpen(false);
      
      toast({
        title: "Document Rejected",
        description: "Document has been rejected and returned for revision",
        variant: "default"
      });
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast({
        title: "Error",
        description: "Failed to reject document",
        variant: "destructive"
      });
    }
  };

  const handleOwnerQueryDocument = async (query: string) => {
    if (!selectedDocument) return;
    
    try {
      const updatedDocument = {
        ...selectedDocument,
        status: 'queried' as any,
        comments: [...(selectedDocument.comments || []), `Query: ${query}`]
      };
      
      const updatedDocuments = documents.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      );
      
      setDocuments(updatedDocuments);
      setSelectedDocument(updatedDocument);
      
      toast({
        title: "Query Sent",
        description: "Document query has been sent",
        variant: "default"
      });
    } catch (error) {
      console.error('Error querying document:', error);
      toast({
        title: "Error",
        description: "Failed to send query",
        variant: "destructive"
      });
    }
  };

  return {
    handleReviewDocument,
    handleUploadRevised,
    handlePushToLive,
    handleAddDocument,
    handleStartReview,
    handleSelectReviewers,
    handleUploadDocument,
    handleApproveDocument,
    handleRejectDocument,
    handleOwnerQueryDocument
  };
};
