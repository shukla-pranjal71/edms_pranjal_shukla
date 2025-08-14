
import React from 'react';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import { DocumentRequest } from '../DocumentRequestForm';
import DocumentInfo from './DocumentInfo';
import ActionButtons from './ActionButtons';
import { safeDocumentStatusForDocumentRequest } from '../../utils/documentUtils';

export interface DocumentViewerContentProps {
  document: BaseDocumentRequest;
  isFullScreen?: boolean;
  showReviewButton?: boolean;
  showChangeStatusButton?: boolean;
  showReviewQueryButton?: boolean;
  showDocumentOwnerActions?: boolean;
  showEditButton?: boolean;
  showStartReviewButton?: boolean;
  onDownload?: () => void;
  onFullScreenToggle?: () => void;
  onReviewClick?: () => void;
  onStatusChange?: () => void;
  onQueryClick?: () => void;
  onApprovalClick?: () => void;
  onEditClick?: () => void;
  onStartReviewClick?: () => void;
  isApproved?: boolean;
}

const DocumentViewerContent: React.FC<DocumentViewerContentProps> = ({
  document,
  isFullScreen = false,
  showReviewButton = false,
  showChangeStatusButton = false,
  showReviewQueryButton = false,
  showDocumentOwnerActions = false,
  showEditButton = false,
  showStartReviewButton = false,
  onDownload,
  onFullScreenToggle,
  onReviewClick,
  onStatusChange,
  onQueryClick,
  onApprovalClick,
  onEditClick,
  onStartReviewClick,
  isApproved = false
}) => {
  // Convert BaseDocumentRequest to DocumentRequest for DocumentInfo component
  const documentForInfo: DocumentRequest = {
    ...document,
    lastRevisionDate: document.lastRevisionDate || '',
    nextRevisionDate: document.nextRevisionDate || '',
    documentType: document.documentType || 'SOP',
    status: safeDocumentStatusForDocumentRequest(document.status),
    complianceContacts: []
  };

  return (
    <div className="flex flex-col h-full">
      <DocumentInfo document={documentForInfo} />
      <ActionButtons
        documentData={documentForInfo}
        userRole={undefined}
        showEditButton={() => showEditButton}
        showStartReviewButton={() => showStartReviewButton}
        isStartReviewButtonDisabled={() => document.status === 'live' || document.status === 'live-cr'}
        showReviewButtonBasedOnRole={() => showReviewButton}
        showChangeStatusButton={showChangeStatusButton}
        handleDownload={onDownload || (() => {})}
        handleEditDocument={onEditClick}
        handleStartReviewClick={onStartReviewClick || (() => {})}
        handleReviewClick={onReviewClick || (() => {})}
        handleChangeStatus={onStatusChange || (() => {})}
      />
    </div>
  );
};

export default DocumentViewerContent;
