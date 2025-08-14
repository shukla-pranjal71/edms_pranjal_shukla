import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BaseDocumentRequest } from "./table/DocumentTableTypes";
import { DocumentRequest } from "./DocumentRequestForm";
import { Button } from "./ui/button";
import { Download, Edit, MessageSquare, CheckCircle } from "lucide-react";
import DialogCloseButton from "./ui/dialog-close-button";
import { ensureDocumentRequestType } from "../utils/documentUtils";
import { Person } from "./PeopleField";
import { FileService } from '@/services/fileService';
import { getStatusBadge } from "../utils/statusBadgeUtils";
import { Badge } from "./ui/badge";
import QueryDialog from "./QueryDialog";
import { getPendingWith } from "./table/DocumentRowUtils";
import { documentLogService } from '@/services/documentLogService';
import { documentService } from '@/services/documentService';

interface ViewDetailsDialogProps {
  document: BaseDocumentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick?: () => void;
  hideEditButton?: boolean;
  showReviewButton?: boolean;
  onStartReview?: () => void;
  userRole?: string;
  onQueryDocument?: (remarks: string) => void;
  onApproveDocument?: () => void;
}

const ViewDetailsDialog: React.FC<ViewDetailsDialogProps> = ({
  document: baseDocument,
  open,
  onOpenChange,
  onEditClick,
  hideEditButton = false,
  showReviewButton = false,
  onStartReview,
  userRole,
  onQueryDocument,
  onApproveDocument
}) => {
  const [showQueryDialog, setShowQueryDialog] = useState(false);
  
  // Ensure we have all the fields we need by converting to DocumentRequest
  const document = ensureDocumentRequestType(baseDocument);

  // Format document owners for display
  const formatOwners = (owners: Person[]) => {
    return owners.map(owner => owner.name).join(', ') || 'Not assigned';
  };

  // Format reviewers for display
  const formatReviewers = (reviewers: Person[]) => {
    return reviewers.map(reviewer => reviewer.name).join(', ') || 'Not assigned';
  };

  // Generate default values for missing data
  const documentCode = document.documentCode || `DOC-${Date.now().toString().slice(-6)}`;
  const versionNumber = document.versionNumber || '1.0';
  const department = document.department || 'General';
  const country = document.country || 'Global';
  const documentType = document.documentType || 'SOP';
  const documentNumber = document.documentNumber || documentCode;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleDownload = () => {
    // Check if document has either fileUrl or documentUrl
    if (document.fileUrl) {
      FileService.downloadFile(document.fileUrl, `${documentCode}-v${versionNumber}.docx`);
    } else if (document.documentUrl) {
      FileService.downloadFile(document.documentUrl, `${documentCode}-v${versionNumber}.docx`);
    } else {
      console.error("No file URL available for download");
    }
  };

  const handleQuerySubmit = async (query: string) => {
    // Log the query action
    await documentLogService.addDocumentLog({
      documentId: document.id,
      action: 'query',
      details: {
        documentName: document.sopName,
        user: getUserDisplayName(),
        userRole: userRole,
        query: query,
        timestamp: new Date().toISOString()
      }
    });

    if (onQueryDocument) {
      onQueryDocument(query);
    }
    setShowQueryDialog(false);
  };

  const handleApprove = async () => {
    // Log the approve action
    await documentLogService.addDocumentLog({
      documentId: document.id,
      action: 'approve',
      details: {
        documentName: document.sopName,
        user: getUserDisplayName(),
        userRole: userRole,
        timestamp: new Date().toISOString()
      }
    });

    // Handle workflow progression based on user role
    if (userRole === 'document-creator') {
      // Change pending with to Document Requester
      await documentService.handleCreatorApproval(document.id, getUserDisplayName());
    } else if (userRole === 'requester' || userRole === 'document-requester') {
      // Change status to under-review and pending with to Document Owner
      await documentService.updateDocumentStatus(document.id, 'under-review', {
        pendingWith: 'Document Owner',
        approvedBy: getUserDisplayName()
      });
    } else if (userRole === 'document-owner') {
      // Change status to approved
      await documentService.handleOwnerApproval(document.id, getUserDisplayName());
    }

    if (onApproveDocument) {
      onApproveDocument();
    }
  };

  const getUserDisplayName = () => {
    // In a real app, this would come from authentication context
    if (userRole === 'document-creator') {
      return 'Document Creator';
    } else if (userRole === 'requester' || userRole === 'document-requester') {
      return 'Document Requester';
    } else if (userRole === 'document-owner') {
      return 'Document Owner';
    } else if (userRole === 'document-reviewer') {
      return 'Document Reviewer';
    }
    return 'User';
  };

  // Updated logic to handle both scenarios for under-review status
  const shouldShowActionButtons = () => {
    if (document.status !== 'under-review') return false;
    
    const pendingWith = getPendingWith(document);
    
    // Document Creator can act when pending with them
    if (userRole === 'document-creator' && pendingWith === 'Document Creator') {
      return true;
    }
    
    // Document Requester can act when pending with them OR when pending with reviewers (since they are the assigned reviewers)
    if ((userRole === 'requester' || userRole === 'document-requester') && 
        (pendingWith === 'Document Requester' || pendingWith === 'Document Requestor' || pendingWith === 'Reviewers' || pendingWith === 'Document Reviewer')) {
      return true;
    }
    
    // Document Reviewer can act when pending with them
    if (userRole === 'document-reviewer' && (pendingWith === 'Document Reviewer' || pendingWith === 'Reviewers')) {
      return true;
    }
    
    return false;
  };

  // Check if document owner should see approve button for under-review status
  const shouldShowOwnerApproval = () => {
    return userRole === 'document-owner' && document.status === 'under-review';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex justify-between items-center">
              <div className="flex flex-col items-start">
                <span>{document.sopName}</span>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(document.status)}
                  {document.isBreached && (
                    <Badge variant="destructive" className="text-white">
                      SLA Breached
                    </Badge>
                  )}
                  {document.pendingWith && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Pending: {document.pendingWith}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!hideEditButton && onEditClick && (
                  <Button size="sm" variant="outline" onClick={onEditClick} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                
                {/* Show query history if document was queried */}
                {document.status === 'queried' && document.comments && (
                  <div className="text-sm text-orange-600 font-medium">
                    Queried - Check comments below
                  </div>
                )}
                
                {/* Action buttons for under-review documents (both pending with reviewers and document creator) */}
                {shouldShowActionButtons() && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowQueryDialog(true)} 
                      className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Query
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleApprove} 
                      className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}

                {/* Document Owner approval for pending-approval status */}
                {shouldShowOwnerApproval() && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowQueryDialog(true)} 
                      className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Query
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleApprove} 
                      className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
                
                <DialogCloseButton onClose={() => onOpenChange(false)} />
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4 dark:text-gray-200">
            {/* Show query comments if any */}
            {document.comments && document.comments.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-3">Document History & Comments</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {document.comments.map((comment, index) => (
                    <div key={index} className="text-sm p-2 bg-white dark:bg-gray-700 rounded border-l-4 border-blue-500">
                      {comment}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs uppercase text-blue-600 dark:text-blue-400 font-semibold mb-1">Document Code</p>
                <p className="font-medium text-lg">{documentCode}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-xs uppercase text-green-600 dark:text-green-400 font-semibold mb-1">Document Type</p>
                <p className="font-medium">{documentType}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-xs uppercase text-purple-600 dark:text-purple-400 font-semibold mb-1">Version</p>
                <p className="font-medium text-lg">{versionNumber}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-xs uppercase text-orange-600 dark:text-orange-400 font-semibold mb-1">Document Number</p>
                <p className="font-medium">{documentNumber}</p>
              </div>
            </div>
            
            {/* Location and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-2">Location & Department</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Country:</span>
                    <span className="font-medium">{country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Department:</span>
                    <span className="font-medium">{department}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-2">Revision Dates</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Revision:</span>
                    <span className="font-medium">{formatDate(document.lastRevisionDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next Revision:</span>
                    <span className="font-medium">{formatDate(document.nextRevisionDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* People Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-3">Document Owner</p>
                {document.documentOwners && document.documentOwners.length > 0 ? (
                  <div className="space-y-2">
                    {document.documentOwners.map((owner, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded">
                        <p className="font-medium">{owner.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{owner.email}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No owners assigned</p>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-3">Reviewers</p>
                {document.reviewers && document.reviewers.length > 0 ? (
                  <div className="space-y-2">
                    {document.reviewers.map((reviewer, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded">
                        <p className="font-medium">{reviewer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reviewer.email}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No reviewers assigned</p>
                )}
              </div>
            </div>

            {/* Additional People */}
            {(document.documentCreators?.length || document.complianceNames?.length) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {document.documentCreators && document.documentCreators.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-semibold mb-3">Document Creators</p>
                    <div className="space-y-2">
                      {document.documentCreators.map((creator, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded">
                          <p className="font-medium">{creator.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{creator.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {document.complianceNames && document.complianceNames.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-semibold mb-3">Compliance Contacts</p>
                    <div className="space-y-2">
                      {document.complianceNames.map((contact, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          
            {document.description && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-2">Description</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{document.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Query Dialog */}
      {showQueryDialog && (
        <QueryDialog
          open={showQueryDialog}
          onOpenChange={setShowQueryDialog}
          onSubmit={handleQuerySubmit}
          documentName={document.sopName}
        />
      )}
    </>
  );
};

export default ViewDetailsDialog;
