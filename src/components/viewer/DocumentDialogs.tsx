
import React from 'react';
import { DocumentRequest } from '../DocumentRequestForm';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import StatusChangeDialog from '../StatusChangeDialog';
import ReviewUploadDialog from '../ReviewUploadDialog';
import ApprovalDialog from '../ApprovalDialog';
import QueryDialog from '../QueryDialog';
import FullScreenDocumentView from './FullScreenDocumentView';

interface DocumentDialogsProps {
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  showStatusChangeDialog: boolean;
  setShowStatusChangeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showReviewUploadDialog: boolean;
  setShowReviewUploadDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showApprovalDialog: boolean;
  setShowApprovalDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showQueryDialog: boolean;
  setShowQueryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  documentData: DocumentRequest;
  onStatusChange?: () => void;
  onReviewClick: () => void;
  handleUploadComplete: () => void;
  handleApproveDocument: () => void;
  handleRejectDocument: (remarks: string) => void;
  handleQuerySubmit: (remarks: string) => void;
  handleDownload: () => void;
  showReviewButton: boolean;
  showChangeStatusButton: boolean;
  showReviewQueryButton: boolean;
  showDocumentOwnerActions: boolean;
  getDocumentForBase: () => BaseDocumentRequest | null;
  userRole?: string;
}

const DocumentDialogs: React.FC<DocumentDialogsProps> = ({
  isFullScreen,
  setIsFullScreen,
  showStatusChangeDialog,
  setShowStatusChangeDialog,
  showReviewUploadDialog,
  setShowReviewUploadDialog,
  showApprovalDialog,
  setShowApprovalDialog,
  showQueryDialog,
  setShowQueryDialog,
  documentData,
  onStatusChange,
  onReviewClick,
  handleUploadComplete,
  handleApproveDocument,
  handleRejectDocument,
  handleQuerySubmit,
  handleDownload,
  showReviewButton,
  showChangeStatusButton,
  showReviewQueryButton,
  showDocumentOwnerActions,
  getDocumentForBase,
  userRole
}) => {
  // Use getDocumentForBase to ensure we have a proper BaseDocumentRequest
  const baseDocument = getDocumentForBase();
  
  // If we can't get a proper base document, don't render anything
  if (!baseDocument) {
    return null;
  }

  return (
    <>
      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={showStatusChangeDialog}
        onOpenChange={setShowStatusChangeDialog}
        document={documentData}
        documentName={documentData.sopName}
        documentId={documentData.id}
        onStatusChange={onStatusChange || (() => {})}
        userRole={userRole}
      />

      {/* Review Upload Dialog */}
      <ReviewUploadDialog
        open={showReviewUploadDialog}
        onOpenChange={setShowReviewUploadDialog}
        documentName={documentData.sopName}
        documentId={documentData.id}
        onUploadComplete={handleUploadComplete}
      />

      {/* Document Approval Dialog - Fix: Remove onApprove prop as it's not in the component interface */}
      <ApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        onReject={handleRejectDocument}
        document={baseDocument}
      />

      {/* Query Dialog */}
      <QueryDialog
        open={showQueryDialog}
        onOpenChange={setShowQueryDialog}
        onSubmit={handleQuerySubmit}
        documentName={documentData.sopName}
      />

      {/* Full Screen Document Viewer - Use baseDocument which has all required fields */}
      <FullScreenDocumentView
        document={baseDocument}
        open={isFullScreen}
        onOpenChange={setIsFullScreen}
        onDownload={handleDownload}
        showReviewButton={showReviewButton}
        showChangeStatusButton={showChangeStatusButton}
        showReviewQueryButton={showReviewQueryButton}
        showDocumentOwnerActions={showDocumentOwnerActions}
        onStatusChange={() => setShowStatusChangeDialog(true)}
        onReviewClick={onReviewClick}
        userRole={userRole}
      />
    </>
  );
};

export default DocumentDialogs;
