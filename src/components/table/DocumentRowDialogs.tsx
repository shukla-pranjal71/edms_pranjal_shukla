
import React from 'react';
import ViewDetailsDialog from '../ViewDetailsDialog';
import SendNotificationDialog from '../SendNotificationDialog';
import DocumentLogsDialog from '../DocumentLogsDialog';
import StatusChangeDialog from '../StatusChangeDialog';
import ApprovalDialog from '../ApprovalDialog';
import QueryDialog from '../QueryDialog';
import { BaseDocumentRequest, DocumentStatus } from './DocumentTableTypes';

interface DocumentRowDialogsProps {
  doc: BaseDocumentRequest;
  userRole?: string;
  showDetailsDialog: boolean;
  setShowDetailsDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showNotificationDialog: boolean;
  setShowNotificationDialog: React.Dispatch<React.SetStateAction<boolean>>;
  isLogsDialogOpen: boolean;
  setIsLogsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showStatusChangeDialog: boolean;
  setShowStatusChangeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showApprovalDialog: boolean;
  setShowApprovalDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showQueryDialog: boolean;
  setShowQueryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onPushNotification: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onStatusChange?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onApproveDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onRejectDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onQueryDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  hideEditButton?: boolean;
}

const DocumentRowDialogs: React.FC<DocumentRowDialogsProps> = ({
  doc,
  userRole,
  showDetailsDialog,
  setShowDetailsDialog,
  showNotificationDialog,
  setShowNotificationDialog,
  isLogsDialogOpen,
  setIsLogsDialogOpen,
  showStatusChangeDialog,
  setShowStatusChangeDialog,
  showApprovalDialog,
  setShowApprovalDialog,
  showQueryDialog,
  setShowQueryDialog,
  onPushNotification,
  onStatusChange,
  onApproveDocument,
  onRejectDocument,
  onQueryDocument,
  hideEditButton = false
}) => {
  const handleSendNotification = (role: string) => {
    // Implement notification sending
    // Close dialog
    setShowNotificationDialog(false);
  };

  const handleStatusChangeConfirm = (newStatus: string) => {
    console.log('DocumentRowDialogs: Confirming status change to:', newStatus, 'for doc:', doc.id);
    if (onStatusChange) {
      // Create a mock event and call the status change handler
      const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
      
      // Create an updated document with the new status
      const updatedDoc = { ...doc, status: newStatus as DocumentStatus };
      onStatusChange(mockEvent, updatedDoc);
    }
    setShowStatusChangeDialog(false);
  };

  const handleRejectConfirm = (reason: string) => {
    console.log('DocumentRowDialogs: Rejecting document:', doc.id, 'with reason:', reason);
    if (onRejectDocument) {
      const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
      onRejectDocument(mockEvent, doc);
    }
    setShowApprovalDialog(false);
  };

  const handleQuerySubmit = (query: string) => {
    console.log('DocumentRowDialogs: Submitting query for document:', doc.id, 'query:', query);
    if (onQueryDocument) {
      const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
      onQueryDocument(mockEvent, doc);
    }
    setShowQueryDialog(false);
  };
  
  return (
    <>
      {/* View Details Dialog */}
      {showDetailsDialog && (
        <ViewDetailsDialog
          document={doc}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          hideEditButton={hideEditButton}
          userRole={userRole}
        />
      )}
      
      {/* Send Notification Dialog */}
      {showNotificationDialog && (
        <SendNotificationDialog
          document={doc}
          open={showNotificationDialog}
          onOpenChange={setShowNotificationDialog}
          onSendNotification={handleSendNotification}
          userRole={userRole}
        />
      )}
      
      {/* Document Logs Dialog */}
      <DocumentLogsDialog
        open={isLogsDialogOpen}
        onOpenChange={setIsLogsDialogOpen}
        documentId={doc.id}
      />
      
      {/* Status Change Dialog */}
      {showStatusChangeDialog && onStatusChange && (
        <StatusChangeDialog
          open={showStatusChangeDialog}
          onOpenChange={setShowStatusChangeDialog}
          onStatusChange={handleStatusChangeConfirm}
          documentName={doc.sopName}
          currentStatus={doc.status}
          userRole={userRole}
          documentId={doc.id}
        />
      )}

      {/* Approval/Rejection Dialog */}
      {showApprovalDialog && (
        <ApprovalDialog
          open={showApprovalDialog}
          onOpenChange={setShowApprovalDialog}
          onReject={handleRejectConfirm}
          document={doc}
        />
      )}

      {/* Query Dialog */}
      {showQueryDialog && (
        <QueryDialog
          open={showQueryDialog}
          onOpenChange={setShowQueryDialog}
          onSubmit={handleQuerySubmit}
          documentName={doc.sopName}
        />
      )}
    </>
  );
};

export default DocumentRowDialogs;
