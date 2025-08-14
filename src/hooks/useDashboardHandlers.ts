
import { Dispatch, SetStateAction } from 'react';
import { DocumentRequest } from '../components/DocumentRequestForm';
import { AdminConfig } from '../components/AdminConfigDialog';
import { ChangeRequest } from '../components/ChangeRequestForm';
import { BaseDocumentRequest } from '../components/table/DocumentTableTypes';
import { Person } from '../components/PeopleField';
import { useToast } from '@/hooks/use-toast';

// Import new hooks
import { 
  useDocumentHandlers,
  useWorkflowHandlers,
  useChangeRequestHandlers,
  useUtilityHandlers
} from './document';

// Import utility functions for document type conversions
import { convertToBaseDocumentRequests } from '../utils/documentUtils';

interface DashboardHandlersProps {
  documents: DocumentRequest[];
  setDocuments: Dispatch<SetStateAction<DocumentRequest[]>>;
  selectedDocument: DocumentRequest | null;
  setSelectedDocument: Dispatch<SetStateAction<DocumentRequest | null>>;
  toast: ReturnType<typeof useToast>['toast'];
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  setShowDetailsDialog: Dispatch<SetStateAction<boolean>>;
  setIsReviewPromptOpen: Dispatch<SetStateAction<boolean>>;
  setIsReviewUploadOpen: Dispatch<SetStateAction<boolean>>;
  adminConfig: AdminConfig;
  setIsReviewerSelectionOpen: Dispatch<SetStateAction<boolean>>;
  setIsApprovalDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsDocumentApprovalOpen: Dispatch<SetStateAction<boolean>>;
  changeRequests: ChangeRequest[];
  setChangeRequests: Dispatch<SetStateAction<ChangeRequest[]>>;
  setSelectedChangeRequest: Dispatch<SetStateAction<ChangeRequest | null>>;
  setIsChangeRequestDetailsOpen: Dispatch<SetStateAction<boolean>>;
  setIsChangeRequestFormOpen: Dispatch<SetStateAction<boolean>>;
  selectedFilter: string | null;
  setSelectedFilter: Dispatch<SetStateAction<string | null>>;
  showChangeRequests: boolean;
  setShowChangeRequests: Dispatch<SetStateAction<boolean>>;
}

export const useDashboardHandlers = ({
  documents,
  setDocuments,
  selectedDocument,
  setSelectedDocument,
  toast,
  setIsFormOpen,
  setShowDetailsDialog,
  setIsReviewPromptOpen,
  setIsReviewUploadOpen,
  adminConfig,
  setIsReviewerSelectionOpen,
  setIsApprovalDialogOpen,
  setIsDocumentApprovalOpen,
  changeRequests,
  setChangeRequests,
  setSelectedChangeRequest,
  setIsChangeRequestDetailsOpen,
  setIsChangeRequestFormOpen,
  selectedFilter,
  setSelectedFilter,
  showChangeRequests,
  setShowChangeRequests
}: DashboardHandlersProps) => {

  // Document handlers
  const {
    handleDownload,
    handleViewDocument,
    handleDocumentSelect,
    handleDeleteDocument,
    handleArchiveDocument,
    handleRestoreDocument,
    handlePushNotification,
    handleEditDocument,
    handleStatusChange,
  } = useDocumentHandlers({
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    setShowDetailsDialog
  });

  // Workflow handlers - fix the interface to include setIsFormOpen
  const {
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
  } = useWorkflowHandlers({
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    setIsFormOpen, // Add this property
    setIsReviewPromptOpen,
    setIsReviewerSelectionOpen,
    setIsReviewUploadOpen,
    adminConfig,
    setIsApprovalDialogOpen,
    setIsDocumentApprovalOpen,
  });

  // Change request handlers
  const {
    viewChangeRequest,
    cancelChangeRequest,
    addChangeRequest
  } = useChangeRequestHandlers({
    changeRequests,
    setChangeRequests,
    selectedChangeRequest: null,
    setSelectedChangeRequest,
    setIsChangeRequestDetailsOpen,
    setIsChangeRequestFormOpen,
  });

  // Utility handlers
  const {
    handleLogout,
    handleFilterClick,
    handleSaveAdminConfig,
    handleExport,
    generateRandomPerson,
    generateDocumentCode,
    generateComment
  } = useUtilityHandlers();

  return {
    // Navigation handlers
    handleLogout,
    handleFilterClick,
    handleRestoreDocument,
    handleDownload,
    handleViewDocument,
    handleDocumentSelect,
    handleDeleteDocument,
    handleArchiveDocument,
    handleReviewDocument,
    handlePushNotification,
    handleUploadRevised,
    handlePushToLive,
    handleAddDocument,
    handleStartReview,
    handleSelectReviewers,
    handleUploadDocument,
    handleApproveDocument,
    handleRejectDocument,
    handleOwnerQueryDocument,
    handleSaveAdminConfig,
    handleStatusChange,
    handleExport,
    handleEditDocument,
    // Map change request handler names
    handleViewChangeRequest: viewChangeRequest,
    handleCancelChangeRequest: cancelChangeRequest,
    handleAddChangeRequest: addChangeRequest
  };
};
