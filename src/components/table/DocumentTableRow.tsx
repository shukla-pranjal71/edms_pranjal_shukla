import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Download, CheckCircle, XCircle, FileCheck, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseDocumentRequest, UserRole } from "./DocumentTableTypes";
import { getStatusBadge, getReviewStatusBadge } from "../../utils/statusBadgeUtils";
import ReviewersHoverCard from '../ReviewersHoverCard';
import DocumentRowActions from './DocumentRowActions';
import DocumentRowDialogs from './DocumentRowDialogs';
import { formatTimestamp, getPendingWith, getDocumentCode, getVersionNumber, getFormattedOwners, getCountryDisplay, formatTableDate } from './DocumentRowUtils';

interface DocumentTableRowProps {
  doc: BaseDocumentRequest;
  userRole?: UserRole;
  showViewButton?: boolean;
  showDeleteArchive?: boolean;
  showRestoreButton?: boolean;
  showRecoverButton?: boolean;
  hideArchiveDelete?: boolean;
  hideChangeStatus?: boolean;
  hideNotification?: boolean;
  hideEditButton?: boolean;
  onRowClick: (doc: BaseDocumentRequest) => void;
  onDelete: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onArchive: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onRestore: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onRecover: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onView: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onViewDetails: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onPushNotification: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onDownload: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onUploadRevised?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onPushToLive?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onFullScreenView?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onStatusChange?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onStartReview?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onReviewDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onApproveDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onRejectDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onQueryDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onCreatorReview?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  areExtraColumnsVisible: boolean;
}

const DocumentTableRow: React.FC<DocumentTableRowProps> = ({
  doc,
  userRole = 'document-controller',
  showViewButton,
  showDeleteArchive,
  showRestoreButton,
  showRecoverButton,
  hideArchiveDelete = false,
  hideChangeStatus = false,
  hideNotification = false,
  hideEditButton = false,
  onRowClick,
  onDelete,
  onArchive,
  onRestore,
  onRecover,
  onView,
  onViewDetails,
  onPushNotification,
  onDownload,
  onUploadRevised,
  onPushToLive,
  onFullScreenView,
  onStatusChange,
  onStartReview,
  onReviewDocument,
  onApproveDocument,
  onRejectDocument,
  onQueryDocument,
  onCreatorReview,
  areExtraColumnsVisible
}) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showQueryDialog, setShowQueryDialog] = useState(false);

  // Handle row click to open details dialog for document creators and requesters
  const handleRowClick = () => {
    if (userRole === 'document-creator' || userRole === 'requester') {
      setShowDetailsDialog(true);
    } else {
      onRowClick(doc);
    }
  };
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailsDialog(true);
  };
  const handleViewLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLogsDialogOpen(true);
  };
  const handlePushNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotificationDialog(true);
  };
  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('DocumentTableRow: Status change clicked for doc:', doc.id);
    setShowStatusChangeDialog(true);
  };
  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApproveDocument) {
      onApproveDocument(e, doc);
    }
  };
  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowApprovalDialog(true);
  };
  const handleStartReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartReview) {
      onStartReview(e, doc);
    }
  };
  const handleReviewDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReviewDocument) {
      onReviewDocument(e, doc);
    }
  };
  const handleCreatorReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreatorReview) {
      onCreatorReview(e, doc);
    }
  };

  // Format reviewers for display - use ReviewersHoverCard
  const formatReviewers = () => {
    if (!doc.reviewers || doc.reviewers.length === 0) return "Not Assigned";

    // Convert to compatible format
    const compatibleReviewers = doc.reviewers.map(reviewer => ({
      id: reviewer.id || '',
      name: reviewer.name,
      email: reviewer.email
    }));
    return <ReviewersHoverCard reviewers={compatibleReviewers} />;
  };

  // Show only first document owner name
  const getFirstOwnerName = () => {
    if (!doc.documentOwners || doc.documentOwners.length === 0) {
      return 'Not Assigned';
    }
    return doc.documentOwners[0].name;
  };

  // Get pending with display for Under Review status - handles both scenarios
  const getPendingWithDisplay = () => {
    if (doc.status === 'under-review') {
      const pendingWith = getPendingWith(doc);
      if (pendingWith === 'Document Creator') {
        // Show document creators
        if (doc.documentCreators && doc.documentCreators.length > 0) {
          return doc.documentCreators.map(creator => creator.name).join(', ');
        }
        return 'Document Creator';
      } else if (pendingWith === 'Document Requester') {
        // Show document requesters (reviewers in this context)
        if (doc.reviewers && doc.reviewers.length > 0) {
          return doc.reviewers.map(reviewer => reviewer.name).join(', ');
        }
        return 'Document Requester';
      } else if (pendingWith === 'Reviewers' || pendingWith === 'Document Reviewer') {
        // Show reviewers
        if (doc.reviewers && doc.reviewers.length > 0) {
          return doc.reviewers.map(reviewer => reviewer.name).join(', ');
        }
        return 'Reviewers';
      }
    }
    return getPendingWith(doc);
  };

  // Determine which buttons to show based on user role and document status
  const shouldShowApproveReject = () => {
    if (userRole === 'document-creator' && doc.status === 'pending-creator-approval') return true;
    if (userRole === 'requester' && doc.status === 'pending-requester-approval') return true;
    if (userRole === 'document-owner' && doc.status === 'pending-owner-approval') return true;
    return false;
  };

  // Updated logic to handle both scenarios for under-review documents
  const shouldShowCreatorReview = () => {
    return userRole === 'document-creator' && 
           doc.status === 'under-review' && 
           getPendingWith(doc) === 'Document Creator';
  };

  // Updated logic for document requesters/reviewers to handle both scenarios
  const shouldShowRequesterReview = () => {
    // Check for both 'requester' and 'document-requester' roles
    if (userRole !== 'requester' && userRole !== 'document-requester') return false;
    if (doc.status !== 'under-review') return false;
    
    const pendingWith = getPendingWith(doc);
    return pendingWith === 'Reviewers' || 
           pendingWith === 'Document Reviewer' || 
           pendingWith === 'Document Requester';
  };

  const shouldShowUploadRevised = () => {
    return userRole === 'document-owner' && doc.status === 'under-revision';
  };

  const shouldShowChangeStatus = () => {
    return userRole === 'document-controller' && doc.status === 'approved';
  };

  const handleAddressQuery = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQueryDocument) {
      onQueryDocument(e, doc);
    }
  };

  const shouldShowAddressQuery = () => {
    return userRole === 'document-controller' && doc.status === 'queried';
  };

  // Determine role-based restrictions
  const canModifyDocuments = userRole === 'document-controller';
  const shouldHideArchiveDelete = hideArchiveDelete || !canModifyDocuments;
  const shouldHideNotification = hideNotification || !canModifyDocuments;

  return <>
      <TableRow key={doc.id} className={`cursor-pointer ${doc.isBreached ? 'bg-red-50 dark:bg-red-900/20' : ''}`} onClick={handleRowClick}>
        <TableCell className="text-foreground p-2 text-sm">{getDocumentCode(doc)}</TableCell>
        <TableCell className="text-foreground p-2 text-sm max-w-[120px] truncate">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="block w-full truncate">{doc.sopName || "Untitled Document"}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{doc.sopName || "Untitled Document"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="text-foreground p-2 text-sm">{getFirstOwnerName()}</TableCell>
        <TableCell className="text-foreground p-2 text-sm">{formatReviewers()}</TableCell>
        <TableCell className="text-foreground p-2 text-sm">{getCountryDisplay(doc)}</TableCell>
        <TableCell className="text-foreground p-2 text-sm">{formatTableDate(doc.lastRevisionDate)}</TableCell>
        <TableCell className="text-foreground p-2 text-sm">
          <div className="flex items-center gap-1">
            {formatTableDate(doc.nextRevisionDate)}
            {getReviewStatusBadge(doc)}
          </div>
        </TableCell>
        <TableCell className="text-foreground p-2 text-sm">{getVersionNumber(doc)}</TableCell>
        <TableCell className="text-foreground p-2 text-sm">{getStatusBadge(doc.status)}</TableCell>
        
        {areExtraColumnsVisible && (
          <>
            <TableCell className="text-foreground p-2 text-sm">{getPendingWithDisplay()}</TableCell>
            <TableCell className="text-foreground p-2 text-sm">
              {doc.createdAt ? formatTimestamp(doc.createdAt) : "Not Available"}
            </TableCell>
            <TableCell className="p-2">
              <Button variant="outline" size="sm" onClick={e => onDownload(e, doc)} className="h-8 w-8 p-0">
                <Download className="h-3 w-3" />
              </Button>
            </TableCell>
            <TableCell className="p-2">
              <div className="flex justify-end gap-1">
                
                {/* Address Query button - only for document-controller with queried status */}
                {shouldShowAddressQuery() && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddressQuery} 
                    className="bg-red-500 hover:bg-red-600 text-white h-8 px-2"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Address Query
                  </Button>
                )}
                
                {/* Document Creator Review button - for under-review documents pending with Document Creator */}
                {shouldShowCreatorReview() && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCreatorReview} 
                    className="bg-blue-500 hover:bg-blue-600 text-white h-8 px-2"
                  >
                    <FileCheck className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                )}

                {/* Document Requester/Reviewer buttons - for under-review documents pending with Reviewers */}
                {shouldShowRequesterReview() && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleApprove} 
                      className="bg-green-500 hover:bg-green-600 text-white h-8 px-2"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQueryDialog(true);
                      }} 
                      className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-2"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Query
                    </Button>
                  </>
                )}

                {/* Approve/Reject buttons for specific roles and statuses */}
                {shouldShowApproveReject() && <>
                    <Button variant="outline" size="sm" onClick={handleApprove} className="bg-green-500 hover:bg-green-600 text-white h-8 px-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white h-8 px-2">
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </>}

                {/* Upload Revised for Document Owner */}
                {shouldShowUploadRevised() && onUploadRevised && <Button variant="outline" size="sm" onClick={e => onUploadRevised(e, doc)} className="bg-blue-500 hover:bg-blue-600 text-white h-8 px-2">
                    Upload Revised
                  </Button>}

                {/* Change Status for Document Controller */}
                {shouldShowChangeStatus() && <Button variant="outline" size="sm" onClick={handleStatusChange} className="bg-purple-500 hover:bg-purple-600 text-white h-8 px-2">
                    Change Status
                  </Button>}
                
                <DocumentRowActions 
                  doc={doc} 
                  userRole={userRole} 
                  showDeleteArchive={showDeleteArchive} 
                  showRestoreButton={showRestoreButton} 
                  showRecoverButton={showRecoverButton} 
                  hideArchiveDelete={shouldHideArchiveDelete} 
                  hideNotification={shouldHideNotification} 
                  hideChangeStatus={hideChangeStatus} 
                  hideEditButton={hideEditButton} 
                  onRestore={onRestore} 
                  onRecover={onRecover} 
                  onArchive={onArchive} 
                  onDelete={onDelete} 
                  onFullScreenView={onFullScreenView} 
                  onStartReview={onStartReview} 
                  onReviewDocument={handleReviewDocument} 
                  handleViewLogs={handleViewLogs} 
                  handlePushNotification={handlePushNotification} 
                />
              </div>
            </TableCell>
          </>
        )}
        <TableCell className="p-2 text-center w-12" />
      </TableRow>

      <DocumentRowDialogs 
        doc={doc} 
        userRole={userRole} 
        showDetailsDialog={showDetailsDialog} 
        setShowDetailsDialog={setShowDetailsDialog} 
        showNotificationDialog={showNotificationDialog} 
        setShowNotificationDialog={setShowNotificationDialog} 
        isLogsDialogOpen={isLogsDialogOpen} 
        setIsLogsDialogOpen={setIsLogsDialogOpen} 
        showStatusChangeDialog={showStatusChangeDialog && !hideChangeStatus} 
        setShowStatusChangeDialog={setShowStatusChangeDialog} 
        onPushNotification={onPushNotification} 
        onStatusChange={onStatusChange} 
        hideEditButton={hideEditButton} 
        showApprovalDialog={showApprovalDialog} 
        setShowApprovalDialog={setShowApprovalDialog} 
        showQueryDialog={showQueryDialog} 
        setShowQueryDialog={setShowQueryDialog} 
        onApproveDocument={onApproveDocument} 
        onRejectDocument={onRejectDocument} 
        onQueryDocument={onQueryDocument} 
      />
    </>;
};

export default DocumentTableRow;
