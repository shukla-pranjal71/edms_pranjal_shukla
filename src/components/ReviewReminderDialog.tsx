import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BaseDocumentRequest } from './table/DocumentTableTypes';

interface ReviewReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onReject: () => void;
  document: BaseDocumentRequest | null;
}

const ReviewReminderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onReject,
  document
}: ReviewReminderDialogProps) => {
  if (!document) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>SOP Review Required</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">
              The following SOP requires review and potential revisions:
            </p>
            <div className="bg-muted p-3 rounded-md mb-3">
              <p><strong>Document:</strong> {document.sopName}</p>
              <p><strong>Document Number:</strong> {document.documentNumber}</p>
              <p><strong>Current Version:</strong> {document.versionNumber}</p>
              <p><strong>Next Revision Date:</strong> {document.nextRevisionDate}</p>
            </div>
            <p>Do you want to review and revise this SOP now?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onReject}>No, Later</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-[#ffa530]">
            Yes, Review Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReviewReminderDialog;
