import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DialogCloseButton from "./ui/dialog-close-button";
import DocumentUploadDialog from './DocumentUploadDialog';
import { DocumentRequest } from './DocumentRequestForm';
import { BaseDocumentRequest } from './table/DocumentTableTypes';
import { convertDocumentRequestToBase } from '../utils/documentUtils';
import { documentLogService } from '@/services';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (newStatus: string) => void;
  documentName: string;
  currentStatus?: string;
  userRole?: string;
  document?: DocumentRequest;
  documentId: string;
}

const StatusChangeDialog = ({
  open,
  onOpenChange,
  onStatusChange,
  documentName,
  currentStatus,
  userRole,
  document,
  documentId,
}: StatusChangeDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadDate, setUploadDate] = useState<Date | undefined>(new Date());

  const handleConfirm = async () => {
    if (userRole === 'document-controller' && currentStatus === 'approved') {
      // For document controllers pushing to live, show the upload dialog
      if (uploadDate) { // Ensure upload date is set before showing upload dialog
        setShowUploadDialog(true);
      }
    } else if (selectedStatus) {
      // Log the status change to backend
      if (document) {
        await documentLogService.logDocumentAction(document.id, 'status_change', { 
          newStatus: selectedStatus,
          previousStatus: document.status,
          changedBy: userRole || 'user'
        });
      }

      onStatusChange(selectedStatus);
      onOpenChange(false);
      setSelectedStatus(undefined);
    }
  };

  const handleUploadComplete = async (comments: string) => {
    setShowUploadDialog(false);

    // Log the status change, document upload and upload date
    if (document) {
      await documentLogService.logDocumentAction(document.id, 'status_change', {
        newStatus: 'live',
        previousStatus: document.status,
        changedBy: userRole || 'document-controller',
        comments,
        uploadDate: uploadDate ? format(uploadDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      });
    }
    
    // After successful upload, change the status
    onStatusChange('live');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedStatus(undefined);
    onOpenChange(false);
  };

  // Generate status options based on user role - removed pending-approval
  const getStatusOptions = () => {
    // If document is already approved, don't allow any status changes except for document controllers pushing to live
    if (currentStatus === 'approved' && userRole !== 'document-controller') {
      return [];
    }
    
    if (userRole === 'document-controller' && currentStatus === 'approved') {
      // Document controllers can only move approved documents to "live" status
      return [
        { value: 'live', label: 'Live' }
      ];
    } else if (userRole === 'reviewer') {
      // Reviewers can only move documents to "reviewed" status
      return [
        { value: 'reviewed', label: 'Reviewed' }
      ];
    }
    
    // For other roles, provide appropriate statuses (removed pending-approval)
    return [
      { value: 'live', label: 'Live' },
      { value: 'under-review', label: 'Under Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' }
    ];
  };

  const statusOptions = getStatusOptions();
  const dialogTitle = currentStatus === 'approved' && userRole === 'document-controller' ? 'Push Document to Live' : 
    currentStatus === 'approved' ? 'Document Approved' : 'Change Document Status';
  
  const dialogDescription = currentStatus === 'approved' && userRole === 'document-controller' ?
    `Confirm pushing "${documentName}" to live status?` :
    currentStatus === 'approved' ? 
    `Document "${documentName}" is approved and cannot have its status changed.` :
    `Select a new status for document: ${documentName}`;

  // Convert DocumentRequest to BaseDocumentRequest if document exists, ensuring createdAt is present
  const baseDocument = document ? {
    ...convertDocumentRequestToBase(document),
    createdAt: document.createdAt || new Date().toISOString()
  } : undefined;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{dialogTitle}</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          
          {userRole !== 'document-controller' && currentStatus !== 'approved' && (
            <div className="space-y-4">
              <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  {statusOptions.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value} 
                      className="dark:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date of Upload field - only show for document controllers with approved documents */}
          {userRole === 'document-controller' && currentStatus === 'approved' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Upload</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !uploadDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {uploadDate ? format(uploadDate, "PPP") : <span>Select upload date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={uploadDate}
                    onSelect={setUploadDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <DialogFooter className="space-x-2">
            {(userRole === 'document-controller' && currentStatus === 'approved') ? (
              <Button 
                onClick={handleConfirm} 
                disabled={!uploadDate}
                className="dark:bg-green-600 dark:hover:bg-green-700"
              >
                Push to Live
              </Button>
            ) : (currentStatus !== 'approved' && (
              <Button 
                onClick={handleConfirm} 
                disabled={!selectedStatus}
                className="dark:bg-green-600 dark:hover:bg-green-700"
              >
                Confirm Status Change
              </Button>
            ))}
            <DialogCloseButton onClose={handleClose} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {baseDocument && showUploadDialog && (
        <DocumentUploadDialog
          document={baseDocument}
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onUpdateComplete={handleUploadComplete}
        />
      )}
    </>
  );
};

export default StatusChangeDialog;
