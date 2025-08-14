
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { BaseDocumentRequest } from './table/DocumentTableTypes';
import { Check, X } from 'lucide-react';
import { documentLogService } from '@/services';

interface ApprovalDialogProps {
  document?: BaseDocumentRequest;
  documentName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

const DocumentApprovalDialog = ({ 
  document, 
  documentName,
  open, 
  onOpenChange, 
  onApprove, 
  onReject 
}: ApprovalDialogProps) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const handleApproveClick = async () => {
    // Log approval action to backend
    if (document) {
      await documentLogService.logDocumentAction(document.id, 'approve', {
        documentName: document?.sopName || documentName || "this document",
        remarks: 'Document approved',
        userRole: localStorage.getItem('userRole') || 'document-owner',
      });
    }
    
    onApprove();
    onOpenChange(false);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  const handleRejectClick = () => {
    setShowRejectForm(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejecting this document");
      return;
    }
    
    // Log rejection action to backend
    if (document) {
      await documentLogService.logDocumentAction(document.id, 'reject', {
        documentName: document?.sopName || documentName || "this document",
        remarks: rejectionReason,
        userRole: localStorage.getItem('userRole') || 'document-owner',
      });
    }
    
    onReject(rejectionReason);
    onOpenChange(false);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  const handleCancel = () => {
    if (showRejectForm) {
      setShowRejectForm(false);
      setRejectionReason("");
    } else {
      onOpenChange(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {showRejectForm ? "Reject Document" : "Review and Approve Document"}
          </AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-300">
            {showRejectForm 
              ? `Please provide a reason for rejecting "${document?.sopName || documentName || "this document"}".`
              : `You are reviewing document "${document?.sopName || documentName || "this document"}". Please choose an action.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {showRejectForm ? (
          <div className="py-4">
            <label htmlFor="rejection-reason" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Reason for Rejection *
            </label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a detailed reason for rejecting this document..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
          </div>
        ) : null}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          
          {showRejectForm ? (
            <AlertDialogAction 
              onClick={handleRejectSubmit}
              className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-800"
              disabled={!rejectionReason.trim()}
            >
              <X className="h-4 w-4 mr-2" />
              Reject Document
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogAction 
                onClick={handleRejectClick}
                className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-800"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </AlertDialogAction>
              <AlertDialogAction 
                onClick={handleApproveClick}
                className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DocumentApprovalDialog;
