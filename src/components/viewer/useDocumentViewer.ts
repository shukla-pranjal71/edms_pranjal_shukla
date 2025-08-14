import { useState } from 'react';
import { DocumentRequest } from '../DocumentRequestForm';
import { BaseDocumentRequest, DocumentType } from '../table/DocumentTableTypes';
import { useToast } from "@/hooks/use-toast";
import { convertDocumentRequestToBase, ensureBaseDocumentRequestType } from '../../utils/documentUtils';
import { FileService } from '@/services/fileService';
import { useToastNotifications } from '@/hooks/document/useToastNotifications';

export const useDocumentViewer = (
  documentData: DocumentRequest | undefined,
  onReview?: () => void,
  userRole?: string,
  onStatusChange?: () => void
) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);
  const [showReviewUploadDialog, setShowReviewUploadDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showQueryDialog, setShowQueryDialog] = useState(false);
  const [showReviewerSelectionDialog, setShowReviewerSelectionDialog] = useState(false);
  const { toast } = useToast();
  const { showInfoToast } = useToastNotifications();

  if (!documentData) return null;

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return "—";
    }
  };

  const getDocumentForBase = (): BaseDocumentRequest | null => {
    if (!documentData) return null;
    
    let safeDocType: DocumentType | undefined = undefined;
    if (documentData.documentType) {
      if (['SOP', 'Policy', 'Workflow', 'Work Instruction', 'Form', 'Template', 'Guideline'].includes(documentData.documentType)) {
        safeDocType = documentData.documentType as DocumentType;
      }
    }
    
    const baseDoc = ensureBaseDocumentRequestType({
      ...documentData,
      documentType: safeDocType,
      complianceNames: Array.isArray(documentData.complianceNames) 
        ? documentData.complianceNames.map(item => 
            typeof item === 'string' 
              ? { id: item, name: item, email: '' } 
              : item
          )
        : []
    });
    
    return baseDoc;
  };

  const handleDownload = async () => {
    if (documentData.fileUrl) {
      try {
        await FileService.downloadFile(
          documentData.fileUrl,
          `${documentData.documentCode}-v${documentData.versionNumber}.docx`
        );
        showInfoToast("Download started", "Your document will download shortly");
      } catch (error) {
        console.error("Error downloading document:", error);
        handleLegacyDownload();
      }
    } else if (documentData.documentUrl) {
      try {
        await FileService.downloadFile(
          documentData.documentUrl,
          `${documentData.documentCode}-v${documentData.versionNumber}.docx`
        );
        showInfoToast("Download started", "Your document will download shortly");
      } catch (error) {
        console.error("Error downloading document with documentUrl:", error);
        handleLegacyDownload();
      }
    } else {
      handleLegacyDownload();
    }
  };

  const handleLegacyDownload = () => {
    const element = window.document.createElement('a');
    const content = `
Document: ${documentData.sopName}
Document Code: ${documentData.documentCode}
Version: ${documentData.versionNumber}
Country: ${documentData.country}
Last Revision: ${documentData.lastRevisionDate}
Next Revision: ${documentData.nextRevisionDate}
Document Owners: ${documentData.documentOwners.map(owner => owner.name).join(', ')}
Reviewers: ${documentData.reviewers.map(reviewer => reviewer.name).join(', ')}
Status: ${documentData.status}
    `;
    const blob = new Blob([content], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const url = URL.createObjectURL(blob);
    element.setAttribute('href', url);
    element.setAttribute('download', `${documentData.documentCode}-v${documentData.versionNumber}.docx`);
    element.style.display = 'none';
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const showEditButton = () => {
    if (documentData.status === 'approved') return false;
    return userRole === 'document-controller' || userRole === 'document-creator';
  };

  const showStartReviewButton = () => {
    return userRole !== 'admin' && 
           userRole === 'document-owner' && 
           (documentData.status === 'under-review' || documentData.status === 'live');
  };

  const isStartReviewButtonDisabled = () => {
    // Disable for all specified roles when status is 'live' or 'live-cr'
    const isTargetRole = userRole === 'document-owner' || 
                        userRole === 'requester' || 
                        userRole === 'document-creator' || 
                        userRole === 'document-controller';
    
    if (isTargetRole && documentData.status === 'live') {
      return true;
    }
    
    return documentData.status === 'live-cr';
  };

  const showReviewButtonBasedOnRole = () => {
    if (documentData.status === 'approved' || 
        documentData.status === 'live' ||
        documentData.status === 'live-cr' ||
        (documentData.status === 'under-review' && userRole === 'document-owner')) {
      return false;
    }
    
    if (userRole === 'document-owner') {
      return new Date(documentData.nextRevisionDate) <= new Date();
    } else if (userRole === 'reviewer') {
      return documentData.status === 'under-review';
    } else if (userRole === 'requester') {
      return true;
    }
    return false;
  };

  const showChangeStatusButton = userRole === 'document-controller' && documentData?.status === 'approved';
  
  const handleChangeStatus = () => {
    setShowStatusChangeDialog(true);
  };
  
  const handleReviewClick = () => {
    if (userRole === 'reviewer') {
      setShowReviewUploadDialog(true);
    } else if (userRole === 'requester') {
      setShowReviewUploadDialog(true);
    } else if (onReview) {
      onReview();
    }
  };
  
  const handleStartReviewClick = () => {
    if (isStartReviewButtonDisabled()) {
      return;
    }
    setShowReviewerSelectionDialog(true);
  };
  
  const handleUploadComplete = () => {
    setShowReviewUploadDialog(false);
    if (onReview) {
      onReview();
    }
  };

  const handleQuerySubmit = (queryText: string) => {
    toast({
      title: "Query Submitted",
      description: `Your query about "${documentData.sopName}" has been sent.`
    });
    
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const handleApproveDocument = () => {
    toast({
      title: "Document Approved",
      description: `"${documentData.sopName}" has been approved.`
    });
    
    if (onStatusChange) {
      onStatusChange();
    }
  };
  
  const handleRejectDocument = (remarks: string) => {
    toast({
      title: "Document Rejected",
      description: `"${documentData.sopName}" has been rejected with comments.`
    });
    
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const documentOwnerActions = userRole === 'document-owner' && 
                              documentData.status === 'under-review';
  
  const reviewerQueryButton = userRole === 'reviewer' && 
                             documentData.status === 'under-review';

  return {
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
    showReviewerSelectionDialog,
    setShowReviewerSelectionDialog,
    formatTimestamp,
    getDocumentForBase,
    handleDownload,
    showReviewButtonBasedOnRole,
    showStartReviewButton,
    isStartReviewButtonDisabled,
    showChangeStatusButton,
    handleChangeStatus,
    handleReviewClick,
    handleStartReviewClick,
    handleUploadComplete,
    handleQuerySubmit,
    handleApproveDocument,
    handleRejectDocument,
    documentOwnerActions,
    reviewerQueryButton,
    showEditButton
  };
};
