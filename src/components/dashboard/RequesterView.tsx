
import React, { useEffect, useState } from 'react';
import { FileEdit, ArrowDown, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DocumentTable } from '../table';
import ChangeRequestsTable from '../ChangeRequestsTable';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import { ChangeRequest } from '../ChangeRequestForm';
import { getFilteredDocuments } from '../../utils/documentFilterUtils';
import { DocumentRequest } from '../DocumentRequestForm';
import { Person } from '../PeopleField';
import { exportToExcel } from '../../utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import RequesterChangeRequestForm from '../RequesterChangeRequestForm';
import CreateRequestDialog from '../CreateRequestDialog';

interface RequesterViewProps {
  documents: BaseDocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  showChangeRequests: boolean;
  setShowChangeRequests: (show: boolean) => void;
  setIsChangeRequestFormOpen: (open: boolean) => void;
  handleDocumentSelect: (doc: BaseDocumentRequest) => void;
  handleDownload: (doc: BaseDocumentRequest) => void;
  handleViewDocument: (doc: BaseDocumentRequest) => void;
  handleViewChangeRequest: (request: ChangeRequest) => void;
  handleCancelChangeRequest: (request: ChangeRequest) => void;
  handleDownloadChangeRequest?: (request: ChangeRequest) => void;
  handleViewLogs?: (request: ChangeRequest) => void;
  changeRequests: ChangeRequest[];
  setSelectedFilter: (filter: string | null) => void;
  setDocuments?: (documents: BaseDocumentRequest[]) => void;
  isChangeRequestFormOpen: boolean;
  onAddChangeRequest?: (request: Partial<ChangeRequest>) => void;
}

export const RequesterView: React.FC<RequesterViewProps> = ({
  documents,
  selectedCountry,
  selectedDepartment,
  searchTerm,
  selectedFilter,
  showChangeRequests,
  setShowChangeRequests,
  setIsChangeRequestFormOpen,
  handleDocumentSelect,
  handleDownload,
  handleViewDocument,
  handleViewChangeRequest,
  handleCancelChangeRequest,
  handleDownloadChangeRequest,
  handleViewLogs,
  changeRequests,
  setSelectedFilter,
  setDocuments,
  isChangeRequestFormOpen,
  onAddChangeRequest
}) => {
  const { toast } = useToast();
  const [isCreateRequestDialogOpen, setIsCreateRequestDialogOpen] = useState(false);
  
  // Apply filters directly to BaseDocumentRequest[]
  const getFilteredDocs = (): BaseDocumentRequest[] => {
    if (selectedFilter === 'breached') {
      // Special case for SLA breached documents
      return documents.filter(doc => (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && doc.isBreached === true && doc.status !== 'deleted' && doc.status !== 'archived');
    } else if (selectedFilter) {
      return documents.filter(doc => (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && doc.status === selectedFilter);
    } else {
      return documents.filter(doc => (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && doc.status !== 'deleted' && doc.status !== 'archived');
    }
  };

  // Define empty handler functions for required props
  const handleDeleteDocument = (doc: BaseDocumentRequest) => {};
  const handleArchiveDocument = (doc: BaseDocumentRequest) => {};
  const handlePushNotification = (doc: BaseDocumentRequest) => {};

  // New function to handle exporting visible documents
  const handleExportDocuments = () => {
    const visibleDocuments = getFilteredDocs();
    exportToExcel(visibleDocuments, 'requester-documents');
  };

  // Handle change request submission
  const handleAddChangeRequest = (request: Partial<ChangeRequest>) => {
    if (onAddChangeRequest) {
      onAddChangeRequest(request);
    }
    setIsChangeRequestFormOpen(false);
    toast({
      title: "Change Request Submitted",
      description: `Change request for ${request.documentName} has been submitted.`,
      variant: "default"
    });
  };

  // Remove the problematic realtime subscription that's causing WebSocket errors
  // The realtime functionality will be handled at a higher level in the application
  useEffect(() => {
    // This effect is intentionally empty to prevent WebSocket configuration issues
    // Real-time updates will be handled through other mechanisms
    console.log('RequesterView mounted - realtime subscription disabled to prevent WebSocket errors');
  }, []);

  return (
    <div className="w-full">
      <div className="rounded-md">
        <div className="mb-4 flex items-center justify-between">
          {showChangeRequests ? (
            <>
              <h2 className="text-xl font-semibold dark:text-white">Change Requests</h2>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsCreateRequestDialogOpen(true)} 
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Request
                </Button>
                <Button variant="outline" onClick={() => setShowChangeRequests(false)}>
                  View Documents
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold dark:text-white">
                {selectedFilter ? `${selectedFilter === 'live' ? 'Live' : selectedFilter === 'under-review' ? 'Under Review' : selectedFilter === 'pending-approval' ? 'Pending Approval' : selectedFilter === 'approved' ? 'Approved' : selectedFilter === 'breached' ? 'SLA Breached' : 'Documents'} Documents` : 'Documents'}
              </h2>
              <div className="flex items-center gap-3">
                <Button onClick={() => setIsChangeRequestFormOpen(true)} className="bg-[#ffa530]">
                  <FileEdit className="mr-2 h-4 w-4" />
                  Request Change
                </Button>
                <Button variant="outline" onClick={() => handleExportDocuments()}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => setShowChangeRequests(true)}>
                  View Change Requests
                </Button>
                {selectedFilter && (
                  <Button variant="outline" onClick={() => setSelectedFilter(null)}>
                    Clear Filter
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        
        {showChangeRequests ? (
          <ChangeRequestsTable 
            requests={changeRequests} 
            onViewRequest={handleViewChangeRequest} 
            onCancelRequest={handleCancelChangeRequest} 
            onDownloadRequest={handleDownloadChangeRequest} 
            onViewLogs={handleViewLogs} 
          />
        ) : (
          <DocumentTable 
            documents={getFilteredDocs()} 
            filterStatus={selectedFilter || undefined} 
            onSelectDocument={handleDocumentSelect} 
            onDeleteDocument={handleDeleteDocument} 
            onArchiveDocument={handleArchiveDocument} 
            onPushNotification={handlePushNotification} 
            onDownload={handleDownload} 
            onViewDocument={handleViewDocument} 
            userRole={'requester'} 
            showDeleteArchive={false}
            hideArchiveDelete={true}
          />
        )}
      </div>

      {/* Change Request Form Dialog - No attachment feature */}
      <RequesterChangeRequestForm
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
