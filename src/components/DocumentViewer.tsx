
import React from 'react';
import { DocumentRequest } from './DocumentRequestForm';
import { useDocumentViewer } from './viewer/useDocumentViewer';
import DocumentViewerContent from './viewer/DocumentViewerContent';
import DocumentDialogs from './viewer/DocumentDialogs';
import EditDocumentForm from './EditDocumentForm';
import ReviewerSelectionDialog from './ReviewerSelectionDialog';
import { ensureBaseDocumentRequestType } from '../utils/documentUtils';
import { useDocumentEdit } from '@/hooks/document/useDocumentEdit';
import { useReviewerSelection } from '@/hooks/document/useReviewerSelection';

interface DocumentViewerProps {
  document?: DocumentRequest;
  onReview?: () => void;
  showReviewButton?: boolean;
  userRole?: string;
  onStatusChange?: () => void;
  onEditDocument?: (updatedDoc: DocumentRequest) => void;
  onQueryDocument?: (remarks: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: documentData,
  onReview,
  showReviewButton = false,
  userRole,
  onStatusChange,
  onEditDocument,
  onQueryDocument
}) => {
  if (!documentData) return null;

  // Ensure document has createdAt and uploadDate
  const docWithRequiredFields = {
    ...documentData,
    createdAt: documentData.createdAt || new Date().toISOString(),
    uploadDate: documentData.uploadDate || new Date().toISOString().split('T')[0]
  };

  // Use custom hooks for document viewer functionality
  const {
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
    getDocumentForBase,
    handleDownload,
    showReviewButtonBasedOnRole,
    showStartReviewButton,
    showChangeStatusButton,
    handleReviewClick,
    handleStartReviewClick,
    handleUploadComplete,
    handleQuerySubmit: origHandleQuerySubmit,
    handleApproveDocument,
    handleRejectDocument,
    documentOwnerActions,
    reviewerQueryButton,
    showEditButton
  } = useDocumentViewer(docWithRequiredFields, onReview, userRole, onStatusChange);
  
  // Use document edit hook
  const { 
    showEditDialog, 
    setShowEditDialog,
    handleEditDocument 
  } = useDocumentEdit(onEditDocument);
  
  // Use reviewer selection hook
  const {
    showReviewerSelectionDialog,
    setShowReviewerSelectionDialog,
    handleReviewerSubmit
  } = useReviewerSelection(docWithRequiredFields, onStatusChange);
  
  // Handle query submission with the new handler for document owners
  const handleQuerySubmit = (remarks: string) => {
    if (userRole === 'document-owner' && onQueryDocument) {
      onQueryDocument(remarks);
    } else {
      origHandleQuerySubmit(remarks);
    }
  };

  // Check if the document is approved
  const isApproved = docWithRequiredFields.status === 'approved';

  // Convert to BaseDocumentRequest for DocumentViewerContent
  const baseDocument = ensureBaseDocumentRequestType(docWithRequiredFields);

  return (
    <>
      <DocumentViewerContent
        document={baseDocument}
        isFullScreen={isFullScreen}
        showReviewButton={showReviewButtonBasedOnRole()}
        showChangeStatusButton={showChangeStatusButton}
        showReviewQueryButton={!!reviewerQueryButton}
        showDocumentOwnerActions={!!documentOwnerActions}
        showEditButton={showEditButton()}
        showStartReviewButton={showStartReviewButton()}
        onDownload={handleDownload}
        onFullScreenToggle={() => setIsFullScreen(true)}
        onReviewClick={handleReviewClick}
        onStatusChange={() => setShowStatusChangeDialog(true)}
        onQueryClick={() => setShowQueryDialog(true)}
        onApprovalClick={() => setShowApprovalDialog(true)}
        onEditClick={() => setShowEditDialog(true)}
        onStartReviewClick={handleStartReviewClick}
        isApproved={isApproved}
      />

      {/* Reviewer Selection Dialog */}
      {showReviewerSelectionDialog && (
        <ReviewerSelectionDialog
          document={docWithRequiredFields}
          open={showReviewerSelectionDialog}
          onOpenChange={setShowReviewerSelectionDialog}
          onSubmit={handleReviewerSubmit}
        />
      )}

      {/* Edit Document Dialog */}
      {showEditDialog && (
        <EditDocumentForm
          document={docWithRequiredFields}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleEditDocument}
        />
      )}

      {/* Dialogs */}
      <DocumentDialogs
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        showStatusChangeDialog={showStatusChangeDialog}
        setShowStatusChangeDialog={setShowStatusChangeDialog}
        showReviewUploadDialog={showReviewUploadDialog}
        setShowReviewUploadDialog={setShowReviewUploadDialog}
        showApprovalDialog={showApprovalDialog}
        setShowApprovalDialog={setShowApprovalDialog}
        showQueryDialog={showQueryDialog}
        setShowQueryDialog={setShowQueryDialog}
        documentData={docWithRequiredFields}
        onStatusChange={onStatusChange}
        onReviewClick={handleReviewClick}
        handleUploadComplete={handleUploadComplete}
        handleApproveDocument={handleApproveDocument}
        handleRejectDocument={handleRejectDocument}
        handleQuerySubmit={handleQuerySubmit}
        handleDownload={handleDownload}
        showReviewButton={showReviewButtonBasedOnRole()}
        showChangeStatusButton={showChangeStatusButton}
        showReviewQueryButton={!!reviewerQueryButton}
        showDocumentOwnerActions={!!documentOwnerActions}
        getDocumentForBase={getDocumentForBase}
        userRole={userRole}
      />
    </>
  );
};

export default DocumentViewer;
