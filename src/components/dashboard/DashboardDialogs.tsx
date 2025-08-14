import React from 'react';
import DocumentRequestForm from '../DocumentRequestForm';
import ViewDetailsDialog from '../ViewDetailsDialog';
import ReviewPromptDialog from '../ReviewPromptDialog';
import ReviewerSelectionDialog from '../ReviewerSelectionDialog';
import DocumentUploadDialog from '../DocumentUploadDialog';
import ApprovalDialog from '../ApprovalDialog';
import ReviewUploadDialog from '../ReviewUploadDialog';
import DocumentApprovalDialog from '../DocumentApprovalDialog';
import AdminConfigDialog from '../AdminConfigDialog';
import ChangeRequestForm from '../ChangeRequestForm';
import ChangeRequestDetailsDialog from '../ChangeRequestDetailsDialog';
import { DocumentRequest } from '../DocumentRequestForm';
import { AdminConfig } from '../AdminConfigDialog';
import { ChangeRequest } from '../ChangeRequestForm';
import { UserRole } from '../table/DocumentTableTypes';
import { ensureBaseDocumentRequestType } from '../../utils/documentUtils';

interface DashboardDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  handleAddDocument: (document: DocumentRequest) => void;
  documents: DocumentRequest[];
  selectedDocument: DocumentRequest | null;
  showDetailsDialog: boolean;
  setShowDetailsDialog: (show: boolean) => void;
  isReviewPromptOpen: boolean;
  setIsReviewPromptOpen: (open: boolean) => void;
  isReviewerSelectionOpen: boolean;
  setIsReviewerSelectionOpen: (open: boolean) => void;
  isDocumentUploadOpen: boolean;
  setIsDocumentUploadOpen: (open: boolean) => void;
  isApprovalDialogOpen: boolean;
  setIsApprovalDialogOpen: (open: boolean) => void;
  isReviewUploadOpen: boolean;
  setIsReviewUploadOpen: (open: boolean) => void;
  isDocumentApprovalOpen: boolean;
  setIsDocumentApprovalOpen: (open: boolean) => void;
  isAdminConfigOpen: boolean;
  setIsAdminConfigOpen: (open: boolean) => void;
  handleStartReview: (reviewers: any[]) => void;
  handleSelectReviewers: (reviewers: any[]) => void;
  handleUploadDocument: () => void;
  handleApproveDocument: () => void;
  handleRejectDocument: (reason: string) => void;
  handleOwnerQueryDocument: (query: string) => void;
  handleSaveAdminConfig: (config: AdminConfig) => void;
  currentUserRole: UserRole;
  adminConfig: AdminConfig;
  isChangeRequestFormOpen: boolean;
  setIsChangeRequestFormOpen: (open: boolean) => void;
  handleAddChangeRequest: (changeRequest: ChangeRequest) => void;
  selectedChangeRequest: ChangeRequest | null;
  isChangeRequestDetailsOpen: boolean;
  setIsChangeRequestDetailsOpen: (open: boolean) => void;
}

export const DashboardDialogs: React.FC<DashboardDialogsProps> = ({
  isFormOpen,
  setIsFormOpen,
  handleAddDocument,
  documents,
  selectedDocument,
  showDetailsDialog,
  setShowDetailsDialog,
  isReviewPromptOpen,
  setIsReviewPromptOpen,
  isReviewerSelectionOpen,
  setIsReviewerSelectionOpen,
  isDocumentUploadOpen,
  setIsDocumentUploadOpen,
  isApprovalDialogOpen,
  setIsApprovalDialogOpen,
  isReviewUploadOpen,
  setIsReviewUploadOpen,
  isDocumentApprovalOpen,
  setIsDocumentApprovalOpen,
  isAdminConfigOpen,
  setIsAdminConfigOpen,
  handleStartReview,
  handleSelectReviewers,
  handleUploadDocument,
  handleApproveDocument,
  handleRejectDocument,
  handleOwnerQueryDocument,
  handleSaveAdminConfig,
  currentUserRole,
  adminConfig,
  isChangeRequestFormOpen,
  setIsChangeRequestFormOpen,
  handleAddChangeRequest,
  selectedChangeRequest,
  isChangeRequestDetailsOpen,
  setIsChangeRequestDetailsOpen
}) => {
  return (
    <>
      {/* Document Request Form */}
      <DocumentRequestForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onAddDocument={handleAddDocument}
        existingDocuments={documents}
        currentUserRole={currentUserRole}
      />
      
      {/* View Details Dialog */}
      {selectedDocument && (
        <ViewDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          document={ensureBaseDocumentRequestType(selectedDocument)}
        />
      )}

      {/* Review Prompt Dialog */}
      <ReviewPromptDialog
        open={isReviewPromptOpen}
        onOpenChange={setIsReviewPromptOpen}
        onConfirm={() => handleStartReview([])}
      />

      {/* Reviewer Selection Dialog */}
      {selectedDocument && (
        <ReviewerSelectionDialog
          open={isReviewerSelectionOpen}
          onOpenChange={setIsReviewerSelectionOpen}
          document={selectedDocument}
          onSubmit={handleSelectReviewers}
        />
      )}

      {/* Document Upload Dialog */}
      {selectedDocument && (
        <DocumentUploadDialog
          open={isDocumentUploadOpen}
          onOpenChange={setIsDocumentUploadOpen}
          document={ensureBaseDocumentRequestType(selectedDocument)}
          onUpdateComplete={handleUploadDocument}
        />
      )}

      {/* Approval Dialog */}
      {selectedDocument && (
        <ApprovalDialog
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
          document={ensureBaseDocumentRequestType(selectedDocument)}
          onReject={handleRejectDocument}
        />
      )}

      {/* Review Upload Dialog */}
      <ReviewUploadDialog
        open={isReviewUploadOpen}
        onOpenChange={setIsReviewUploadOpen}
        documentName={selectedDocument?.sopName || ''}
        documentId={selectedDocument?.id || ''}
        onUploadComplete={() => {}}
      />

      {/* Document Approval Dialog */}
      {selectedDocument && (
        <DocumentApprovalDialog
          open={isDocumentApprovalOpen}
          onOpenChange={setIsDocumentApprovalOpen}
          document={ensureBaseDocumentRequestType(selectedDocument)}
          onApprove={handleApproveDocument}
          onReject={handleRejectDocument}
        />
      )}

      {/* Admin Config Dialog */}
      <AdminConfigDialog
        open={isAdminConfigOpen}
        onOpenChange={setIsAdminConfigOpen}
        initialConfig={adminConfig}
        onSave={handleSaveAdminConfig}
      />

      {/* Change Request Form */}
      <ChangeRequestForm
        open={isChangeRequestFormOpen}
        onOpenChange={setIsChangeRequestFormOpen}
        onSubmit={handleAddChangeRequest}
        documents={ensureBaseDocumentRequestType ? documents.map(doc => ensureBaseDocumentRequestType(doc)) : []}
      />

      {/* Change Request Details Dialog */}
      {selectedChangeRequest && (
        <ChangeRequestDetailsDialog
          open={isChangeRequestDetailsOpen}
          onOpenChange={setIsChangeRequestDetailsOpen}
          request={selectedChangeRequest}
        />
      )}
    </>
  );
};
