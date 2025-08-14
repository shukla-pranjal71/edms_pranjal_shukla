import { Dispatch, SetStateAction } from 'react';
import { DocumentRequest, DocumentStatus } from '@/components/DocumentRequestForm';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';
import { documentService } from '@/services/documentService';
import { useToastNotifications } from './useToastNotifications';
import { FileService } from '@/services/fileService';
import { handleLiveDocumentChangeRequest } from '@/utils/liveDocumentUtils';

interface DocumentHandlersProps {
  documents: DocumentRequest[];
  setDocuments: Dispatch<SetStateAction<DocumentRequest[]>>;
  selectedDocument: DocumentRequest | null;
  setSelectedDocument: Dispatch<SetStateAction<DocumentRequest | null>>;
  setShowDetailsDialog: Dispatch<SetStateAction<boolean>>;
}

export const useDocumentHandlers = ({
  documents,
  setDocuments,
  selectedDocument,
  setSelectedDocument,
  setShowDetailsDialog
}: DocumentHandlersProps) => {
  const { 
    showSuccessToast, 
    showErrorToast,
    showInfoToast
  } = useToastNotifications();
  
  // Download document
  const handleDownload = async (doc: BaseDocumentRequest) => {
    try {
      if (doc.fileUrl) {
        await FileService.downloadFile(
          doc.fileUrl, 
          `${doc.documentCode}-${doc.versionNumber}.docx`
        );
        showSuccessToast("Download started", `Downloading ${doc.sopName}...`);
      } else {
        showErrorToast("Download Error", "No file available for download");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      showErrorToast("Download Error", "Failed to download document");
    }
  };

  // View document details
  const handleViewDocument = (doc: BaseDocumentRequest) => {
    console.log("Viewing document:", doc);
    const fullDoc = documents.find(d => d.id === doc.id);
    setSelectedDocument(fullDoc || null);
    setShowDetailsDialog(true);
  };

  // Select a document
  const handleDocumentSelect = (doc: BaseDocumentRequest) => {
    console.log("Selected document:", doc);
    const fullDoc = documents.find(d => d.id === doc.id);
    setSelectedDocument(fullDoc || null);
  };

  // Delete document
  const handleDeleteDocument = async (doc: BaseDocumentRequest) => {
    try {
      await documentService.deleteDocument(doc.id);
      
      const updatedDocs = documents.map(d => {
        if (d.id === doc.id) {
          return { ...d, status: 'deleted' as DocumentStatus };
        }
        return d;
      });
      
      setDocuments(updatedDocs);
      showSuccessToast("Document Deleted", `${doc.sopName} has been deleted.`);
    } catch (error) {
      console.error("Error deleting document:", error);
      showErrorToast("Error", "Failed to delete document. Please try again.");
    }
  };

  // Archive document
  const handleArchiveDocument = async (doc: BaseDocumentRequest) => {
    try {
      await documentService.archiveDocument(doc.id);
      
      const updatedDocs = documents.map(d => {
        if (d.id === doc.id) {
          return { ...d, status: 'archived' as DocumentStatus };
        }
        return d;
      });
      
      setDocuments(updatedDocs);
      showSuccessToast("Document Archived", `${doc.sopName} has been archived.`);
    } catch (error) {
      console.error("Error archiving document:", error);
      showErrorToast("Error", "Failed to archive document. Please try again.");
    }
  };

  // Restore document
  const handleRestoreDocument = async (doc: BaseDocumentRequest) => {
    try {
      await documentService.restoreDocument(doc.id);
      
      const originalStatus = doc.status === 'deleted' ? 'draft' : 'live';
      const updatedDocs = documents.map(d => {
        if (d.id === doc.id) {
          return { ...d, status: originalStatus as DocumentStatus };
        }
        return d;
      });
      
      setDocuments(updatedDocs);
      showSuccessToast("Document Restored", `${doc.sopName} has been restored.`);
    } catch (error) {
      console.error("Error restoring document:", error);
      showErrorToast("Error", "Failed to restore document. Please try again.");
    }
  };

  // Push notification
  const handlePushNotification = (doc: BaseDocumentRequest) => {
    // In a real app this would send actual notifications
    showSuccessToast("Notification Sent", `Notification sent for ${doc.sopName}.`);
  };

  // Edit document
  const handleEditDocument = async (updatedDoc: DocumentRequest) => {
    try {
      // Update the document in the database
      const result = await documentService.updateDocument(updatedDoc);
      
      if (result) {
        // Update the document in the local state
        const updatedDocs = documents.map(doc => {
          if (doc.id === updatedDoc.id) {
            return result;
          }
          return doc;
        });
        
        setDocuments(updatedDocs);
        setSelectedDocument(result);
        
        showSuccessToast("Document Updated", `${result.sopName} has been updated.`);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      showErrorToast("Error", "Failed to update document. Please try again.");
    }
  };

  // Enhanced change document status handler with Live-CR transition
  const handleStatusChange = async (documentId: string, newStatus: DocumentStatus) => {
    try {
      console.log('useDocumentHandlers: Changing status for document:', documentId, 'to:', newStatus);
      
      // Find the current document
      const currentDoc = documents.find(doc => doc.id === documentId);
      
      // Handle Live to Live-CR transition for change requests
      let finalStatus = newStatus;
      if (currentDoc?.status === 'live' && newStatus === 'under-review') {
        finalStatus = 'live-cr' as DocumentStatus;
        console.log('Transitioning Live document to Live-CR for change request');
      }
      
      // Update the status in the backend first
      const updatedDocument = await documentService.updateDocumentStatus(documentId, finalStatus);
      
      if (updatedDocument) {
        // Update the local state with the response from backend
        const updatedDocs = documents.map(doc => {
          if (doc.id === documentId) {
            return updatedDocument;
          }
          return doc;
        });
        
        setDocuments(updatedDocs);
        
        // Update selected document if it's the one being changed
        if (selectedDocument && selectedDocument.id === documentId) {
          setSelectedDocument(updatedDocument);
        }
        
        showSuccessToast("Status Updated", `Document status updated to ${finalStatus}.`);
        console.log('Status change successful:', updatedDocument);
      } else {
        throw new Error('Failed to update document status - no response from server');
      }
    } catch (error) {
      console.error("Error changing status:", error);
      showErrorToast("Error", "Failed to update document status. Please try again.");
    }
  };

  return {
    handleDownload,
    handleViewDocument,
    handleDocumentSelect,
    handleDeleteDocument,
    handleArchiveDocument,
    handleRestoreDocument,
    handlePushNotification,
    handleEditDocument,
    handleStatusChange
  };
};
