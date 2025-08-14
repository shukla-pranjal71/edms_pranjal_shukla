import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BaseDocumentRequest, UserRole } from './table/DocumentTableTypes';
import { useDocumentRequestForm } from '@/hooks/useDocumentRequestForm';
import DocumentDetailsTab from './forms/DocumentDetailsTab';
import DocumentAttachmentTab from './forms/DocumentAttachmentTab';
import { Person } from './PeopleField';

interface DocumentRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDocument: (document: DocumentRequest) => void;
  existingDocuments?: DocumentRequest[];
  currentUserRole?: UserRole;
}

export interface DocumentRequest {
  id: string;
  sopName: string;
  documentCode: string;
  documentNumber?: string;
  country: string;
  lastRevisionDate: string;
  nextRevisionDate: string;
  versionNumber: string;
  status: DocumentStatus;
  uploadDate?: string;
  documentOwners: Person[];
  reviewers: Person[];
  complianceNames: Person[];
  documentCreators: Person[];
  complianceContacts?: Person[];
  comments?: string[];
  needsReview?: boolean;
  reviewDue?: boolean;
  isBreached?: boolean;
  attachmentName?: string;
  documentType: import('./table/DocumentTableTypes').DocumentType;
  department: string;
  reviewStartDate?: string;
  reviewDeadline?: string;
  documentUrl?: string;
  fileUrl?: string;
  createdAt?: string;
  description?: string;
  effectiveDate?: string;
  pendingWith?: string;
  documentLanguage?: string;
}

export type DocumentStatus = 
  | 'draft'
  | 'under-review'
  | 'approved'
  | 'live'
  | 'live-cr'
  | 'archived'
  | 'deleted'
  | 'queried'
  | 'reviewed'
  | 'pending-with-requester';

const DocumentRequestForm: React.FC<DocumentRequestFormProps> = ({
  open,
  onOpenChange,
  onAddDocument,
  existingDocuments = [],
  currentUserRole = 'document-controller'
}) => {
  const {
    documentRequest,
    lastRevDate,
    nextRevDate,
    activeTab,
    setActiveTab,
    attachment,
    isSubmitting,
    isUploading,
    handleInputChange,
    handleSelectChange,
    handleDocumentNameChange,
    handleCountryChange,
    handleDepartmentChange,
    handleRevDateSelect,
    handlePeopleChange,
    handleFileChange,
    handleSubmit
  } = useDocumentRequestForm({
    onAddDocument,
    onOpenChange,
    existingDocuments,
    currentUserRole
  });

  // Check if current user is document creator
  const isDocumentCreator = currentUserRole === 'document-creator';

  // Handle submit for document creators (without attachment)
  const handleDocumentCreatorSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold">Add New Document Request</DialogTitle>
        </DialogHeader>

        {isDocumentCreator ? (
          // Single tab view for document creators (no attachment)
          <div className="space-y-3">
            <DocumentDetailsTab
              documentRequest={documentRequest}
              lastRevDate={lastRevDate}
              nextRevDate={nextRevDate}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onDocumentNameChange={handleDocumentNameChange}
              onCountryChange={handleCountryChange}
              onDepartmentChange={handleDepartmentChange}
              onRevDateSelect={handleRevDateSelect}
              onPeopleChange={handlePeopleChange}
              onNextTab={() => {}} // No next tab for document creators
            />
            
            {/* Submit button for document creators */}
            <div className="flex justify-end pt-4">
              <Button 
                type="button" 
                onClick={handleDocumentCreatorSubmit} 
                disabled={isSubmitting} 
                className="bg-[#ffa530]"
              >
                {isSubmitting ? "Creating..." : "Create Document Request"}
              </Button>
            </div>
          </div>
        ) : (
          // Tabbed view for other users (with attachment)
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="details">Document Details</TabsTrigger>
              <TabsTrigger value="attachment">Document Attachment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-3">
              <DocumentDetailsTab
                documentRequest={documentRequest}
                lastRevDate={lastRevDate}
                nextRevDate={nextRevDate}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onDocumentNameChange={handleDocumentNameChange}
                onCountryChange={handleCountryChange}
                onDepartmentChange={handleDepartmentChange}
                onRevDateSelect={handleRevDateSelect}
                onPeopleChange={handlePeopleChange}
                onNextTab={() => setActiveTab("attachment")}
              />
            </TabsContent>
            
            <TabsContent value="attachment">
              <DocumentAttachmentTab
                attachment={attachment}
                onFileChange={handleFileChange}
                onBackTab={() => setActiveTab("details")}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isUploading={isUploading}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentRequestForm;
