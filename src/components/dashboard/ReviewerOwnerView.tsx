import React, { useState } from 'react';
import { DocumentRequest, DocumentStatus } from '../DocumentRequestForm';
import { DocumentTable } from '../table';
import { BaseDocumentRequest, UserRole } from '../table/DocumentTableTypes';
import { getFilteredDocuments } from '../../utils/documentFilterUtils';
import { Button } from "@/components/ui/button";
import { ArrowDown, FileText, Edit3, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { notificationService } from '../../utils/notificationService';
import { safeDocumentStatus, ensureBaseDocumentRequestType } from '../../utils/documentUtils';
import { exportToExcel } from '../../utils/exportUtils';
import { Person } from '../PeopleField';
import { ChangeRequest } from '../ChangeRequestForm';
import { OwnerChangeRequestsView } from './OwnerChangeRequestsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChangeRequestForm from '../ChangeRequestForm';
import { ContentCard, PageActions } from '../layout';
import CreateRequestDialog from '../CreateRequestDialog';

interface ReviewerOwnerViewProps {
  documents: BaseDocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  currentUserRole: UserRole;
  selectedDocument: BaseDocumentRequest | null;
  handleDocumentSelect: (document: BaseDocumentRequest) => void;
  handleDeleteDocument: (document: BaseDocumentRequest) => void;
  handleArchiveDocument: (document: BaseDocumentRequest) => void;
  handleReviewDocument: (document: BaseDocumentRequest) => void;
  handleDownload: (document: BaseDocumentRequest) => void;
  handleViewDocument: (document: BaseDocumentRequest) => void;
  handlePushNotification: (document: BaseDocumentRequest) => void;
  handleUploadRevised: (document: BaseDocumentRequest) => void;
  handlePushToLive: (document: BaseDocumentRequest) => void;
  setSelectedFilter: (filter: string | null) => void;
  setIsReviewUploadOpen: (open: boolean) => void;
  setIsDocumentApprovalOpen: (open: boolean) => void;
  handleExport: () => void;
  changeRequests?: ChangeRequest[];
  onApproveChangeRequest?: (request: ChangeRequest) => void;
  onRejectChangeRequest?: (request: ChangeRequest) => void;
  onQueryChangeRequest?: (request: ChangeRequest) => void;
}

export const ReviewerOwnerView: React.FC<ReviewerOwnerViewProps> = ({
  documents,
  selectedCountry,
  selectedDepartment,
  searchTerm,
  selectedFilter,
  currentUserRole,
  selectedDocument,
  handleDocumentSelect,
  handleDeleteDocument,
  handleArchiveDocument,
  handleReviewDocument,
  handleDownload,
  handleViewDocument,
  handlePushNotification,
  handleUploadRevised,
  handlePushToLive,
  setSelectedFilter,
  setIsReviewUploadOpen,
  setIsDocumentApprovalOpen,
  handleExport,
  changeRequests = [],
  onApproveChangeRequest,
  onRejectChangeRequest,
  onQueryChangeRequest
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("documents");
  const [isChangeRequestFormOpen, setIsChangeRequestFormOpen] = useState(false);
  const [isCreateRequestDialogOpen, setIsCreateRequestDialogOpen] = useState(false);
  
  // Apply filters directly to BaseDocumentRequest[]
  const getFilteredDocs = (): BaseDocumentRequest[] => {
    if (selectedFilter === 'breached') {
      // Special case for SLA breached documents
      return documents.filter(doc => 
        (doc.country === selectedCountry || selectedCountry === 'all') &&
        (doc.department === selectedDepartment || selectedDepartment === 'all') &&
        (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
         searchTerm === '') &&
        doc.isBreached === true &&
        doc.status !== 'deleted' && 
        doc.status !== 'archived'
      );
    } else if (selectedFilter) {
      return documents.filter(doc => 
        (doc.country === selectedCountry || selectedCountry === 'all') &&
        (doc.department === selectedDepartment || selectedDepartment === 'all') &&
        (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
         searchTerm === '') &&
        doc.status === selectedFilter
      );
    } else {
      return documents.filter(doc => 
        (doc.country === selectedCountry || selectedCountry === 'all') &&
        (doc.department === selectedDepartment || selectedDepartment === 'all') &&
        (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
         searchTerm === '') &&
        doc.status !== 'deleted' && 
        doc.status !== 'archived'
      );
    }
  };

  // New function to export documents
  const handleExportDocuments = () => {
    const visibleDocuments = getFilteredDocs();
    exportToExcel(visibleDocuments, 'owner-documents');
  };

  // Handlers for change requests
  const handleApproveChangeRequest = (request: ChangeRequest) => {
    if (onApproveChangeRequest) {
      onApproveChangeRequest(request);
    }
  };

  const handleRejectChangeRequest = (request: ChangeRequest) => {
    if (onRejectChangeRequest) {
      onRejectChangeRequest(request);
    }
  };

  const handleQueryChangeRequest = (request: ChangeRequest) => {
    if (onQueryChangeRequest) {
      onQueryChangeRequest(request);
    }
  };

  const handleAddChangeRequest = (request: Partial<ChangeRequest>, attachment?: File) => {
    // Handle the change request submission
    console.log('New change request:', request);
    setIsChangeRequestFormOpen(false);
    toast({
      title: "Change Request Submitted",
      description: `Change request for ${request.documentName} has been submitted.`,
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Show tabs only for document owners */}
      {currentUserRole === 'document-owner' ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="change-requests" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <ContentCard
              title="Document Management"
              description="Manage your documents and requests"
              actions={
                <PageActions
                  actions={[
                    {
                      label: "Add New Document",
                      onClick: () => setIsChangeRequestFormOpen(true),
                      variant: "default",
                      icon: <Edit3 className="h-4 w-4" />
                    },
                    {
                      label: "Export",
                      onClick: handleExportDocuments,
                      variant: "outline",
                      icon: <ArrowDown className="h-4 w-4" />
                    }
                  ]}
                />
              }
            >
              <DocumentTable
                documents={getFilteredDocs()}
                onSelectDocument={handleDocumentSelect}
                onDeleteDocument={handleDeleteDocument}
                onArchiveDocument={handleArchiveDocument}
                onDownload={handleDownload}
                onViewDocument={handleViewDocument}
                onPushNotification={handlePushNotification}
                userRole={currentUserRole}
                onUploadRevised={handleUploadRevised}
              />
            </ContentCard>
          </TabsContent>

          <TabsContent value="change-requests">
            <ContentCard
              title="Requests"
              description="Review and manage change requests"
              actions={
                <PageActions
                  actions={[
                    {
                      label: "Create Request",
                      onClick: () => setIsCreateRequestDialogOpen(true),
                      variant: "default",
                      icon: <Plus className="h-4 w-4" />
                    }
                  ]}
                />
              }
            >
              <OwnerChangeRequestsView
                changeRequests={changeRequests}
                onApproveRequest={handleApproveChangeRequest}
                onRejectRequest={handleRejectChangeRequest}
                onQueryRequest={handleQueryChangeRequest}
              />
            </ContentCard>
          </TabsContent>
        </Tabs>
      ) : (
        // For reviewers, show only documents
        <ContentCard
          title="Document Review"
          description="Review and manage documents"
          actions={
            <PageActions
              actions={[
                {
                  label: "Export",
                  onClick: handleExportDocuments,
                  variant: "outline",
                  icon: <ArrowDown className="h-4 w-4" />
                }
              ]}
            />
          }
        >
          <DocumentTable
            documents={getFilteredDocs()}
            onSelectDocument={handleDocumentSelect}
            onDeleteDocument={handleDeleteDocument}
            onArchiveDocument={handleArchiveDocument}
            onDownload={handleDownload}
            onViewDocument={handleViewDocument}
            onPushNotification={handlePushNotification}
            userRole={currentUserRole}
          />
        </ContentCard>
      )}

      {/* Change Request Form Dialog */}
      <ChangeRequestForm
        open={isChangeRequestFormOpen}
        onOpenChange={setIsChangeRequestFormOpen}
        onSubmit={handleAddChangeRequest}
        documents={documents}
      />

      {/* Create Request Dialog */}
      <CreateRequestDialog
        open={isCreateRequestDialogOpen}
        onOpenChange={setIsCreateRequestDialogOpen}
        documents={documents}
      />
    </div>
  );
};
