
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Archive, Trash2, Bell, RefreshCcw, RotateCw, Play, FileEdit, History, FileSearch, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BaseDocumentRequest, UserRole } from "./DocumentTableTypes";

interface DocumentRowActionsProps {
  doc: BaseDocumentRequest;
  userRole?: UserRole;
  showDeleteArchive?: boolean;
  showRestoreButton?: boolean;
  showRecoverButton?: boolean;
  hideArchiveDelete?: boolean;
  hideNotification?: boolean;
  hideChangeStatus?: boolean;
  hideEditButton?: boolean;
  onDelete: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onArchive: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onRestore: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onRecover: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onFullScreenView?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onStartReview?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  onReviewDocument?: (e: React.MouseEvent, doc: BaseDocumentRequest) => void;
  handleViewLogs: (e: React.MouseEvent) => void;
  handlePushNotification: (e: React.MouseEvent) => void;
}

const DocumentRowActions: React.FC<DocumentRowActionsProps> = ({
  doc,
  userRole = 'document-controller',
  showDeleteArchive = true,
  showRestoreButton = false,
  showRecoverButton = false,
  hideArchiveDelete = false,
  hideNotification = false,
  hideChangeStatus = false,
  hideEditButton = false,
  onDelete,
  onArchive,
  onRestore,
  onRecover,
  onFullScreenView,
  onStartReview,
  onReviewDocument,
  handleViewLogs,
  handlePushNotification,
}) => {
  // Check if document is approved (only affects certain actions, not delete/archive)
  const isApproved = doc.status === 'approved';
  
  // Determine if user should see archive/delete/notification options
  const canModifyDocuments = userRole === 'document-controller';
  
  // Hide Archive, Delete, and Send Reminder for document-creator and requester roles
  const shouldHideRestrictedActions = userRole === 'document-creator' || userRole === 'requester';
  
  // Check if user can start review (exclude admin by checking if user is not admin first)
  const canStartReview = userRole !== 'admin' && (userRole === 'document-owner' || userRole === 'document-controller');
  
  // Check if start review should be disabled for live documents
  const isStartReviewDisabled = () => {
    const isTargetRole = userRole === 'document-owner' || 
                        userRole === 'requester' || 
                        userRole === 'document-creator' || 
                        userRole === 'document-controller';
    
    return isTargetRole && doc.status === 'live';
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="dark:hover:bg-gray-700">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewLogs} className="cursor-pointer flex items-center gap-2">
          <History className="h-4 w-4" />
          View History
        </DropdownMenuItem>
        
        {/* Hide notification option for document creators and requesters */}
        {!hideNotification && !isApproved && canModifyDocuments && !shouldHideRestrictedActions && (
          <DropdownMenuItem onClick={handlePushNotification} className="cursor-pointer flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Send Reminder
          </DropdownMenuItem>
        )}
        
        {onFullScreenView && (
          <DropdownMenuItem onClick={(e) => onFullScreenView(e, doc)} className="cursor-pointer flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Full Screen View
          </DropdownMenuItem>
        )}
        
        {canStartReview && 
          doc.status === 'live' && onStartReview && !isApproved && (
          <DropdownMenuItem 
            onClick={isStartReviewDisabled() ? undefined : (e) => onStartReview(e, doc)} 
            className={`cursor-pointer flex items-center gap-2 ${isStartReviewDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isStartReviewDisabled()}
          >
            <Play className="h-4 w-4" />
            Start Review
          </DropdownMenuItem>
        )}
        
        {userRole === 'reviewer' && doc.status === 'under-review' && onReviewDocument && !isApproved && (
          <DropdownMenuItem onClick={(e) => onReviewDocument(e, doc)} className="cursor-pointer flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            Review Document
          </DropdownMenuItem>
        )}

        {showRestoreButton && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => onRestore(e, doc)} className="cursor-pointer flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Restore
            </DropdownMenuItem>
          </>
        )}
        
        {showRecoverButton && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => onRecover(e, doc)} className="cursor-pointer flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Recover
            </DropdownMenuItem>
          </>
        )}
        
        {/* Hide Delete and Archive options for document creators and requesters */}
        {showDeleteArchive && !hideArchiveDelete && canModifyDocuments && !shouldHideRestrictedActions && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => onArchive(e, doc)} className="text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onDelete(e, doc)} className="text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DocumentRowActions;
