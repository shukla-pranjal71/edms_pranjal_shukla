import React, { useEffect, useState } from 'react';
import { FileEdit, ArrowDown, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DocumentTable } from '../table';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import { getFilteredDocuments, getArchivedDocuments } from '../../utils/documentFilterUtils';
import { exportToExcel } from '../../utils/exportUtils';
import { convertToBaseDocumentRequests } from '../../utils/documentUtils';
import DocumentControllerRequestForm, { DocumentControllerRequest } from '../DocumentControllerRequestForm';
import { FloatingFilterPanel } from '../admin/FloatingFilterPanel';
interface DocumentControllerViewProps {
  documents: BaseDocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  showArchivedDocuments: boolean;
  setShowArchivedDocuments: (show: boolean) => void;
  handleDocumentSelect: (doc: BaseDocumentRequest) => void;
  handleDownload: (doc: BaseDocumentRequest) => void;
  handleViewDocument: (doc: BaseDocumentRequest) => void;
  handleExport: () => void;
  handleDeleteDocument: (doc: BaseDocumentRequest) => void;
  handleArchiveDocument: (doc: BaseDocumentRequest) => void;
  handleRestoreDocument: (doc: BaseDocumentRequest) => void;
  handlePushNotification: (doc: BaseDocumentRequest) => void;
  handleStatusChange: (documentId: string, status: string) => void;
  handleApproveDocument: (doc: BaseDocumentRequest) => void;
  handleRejectDocument: (doc: BaseDocumentRequest) => void;
  handleQueryDocument: (doc: BaseDocumentRequest) => void;
  handleUploadRevised?: (doc: BaseDocumentRequest) => void;
  handleCreatorReview?: (doc: BaseDocumentRequest) => void;
  // Add new props for filter control
  setSelectedCountry: (country: string) => void;
  setSelectedDepartment: (department: string) => void;
  setSearchTerm: (term: string) => void;
  documentLevel: string;
  setDocumentLevel: (level: string) => void;
}
export const DocumentControllerView: React.FC<DocumentControllerViewProps> = ({
  documents,
  selectedCountry,
  selectedDepartment,
  searchTerm,
  selectedFilter,
  showArchivedDocuments,
  setShowArchivedDocuments,
  handleDocumentSelect,
  handleDownload,
  handleViewDocument,
  handleExport,
  handleDeleteDocument,
  handleArchiveDocument,
  handleRestoreDocument,
  handlePushNotification,
  handleStatusChange,
  handleApproveDocument,
  handleRejectDocument,
  handleQueryDocument,
  handleUploadRevised,
  handleCreatorReview,
  setSelectedCountry,
  setSelectedDepartment,
  setSearchTerm,
  documentLevel,
  setDocumentLevel
}) => {
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = useState(false);

  // Apply filters directly to BaseDocumentRequest[] - updated to handle pending-approval conversion
  const getFilteredDocs = (): BaseDocumentRequest[] => {
    if (selectedFilter === 'breached') {
      // Special case for SLA breached documents
      return documents.filter(doc => (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && doc.isBreached === true && doc.status !== 'deleted' && doc.status !== 'archived');
    } else if (selectedFilter === 'pending-approval') {
      // Convert pending-approval filter to under-review
      return documents.filter(doc => (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && doc.status === 'under-review');
    } else if (selectedFilter) {
      return documents.filter(doc => (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && doc.status === selectedFilter);
    } else {
      return documents.filter(doc => (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && doc.status !== 'deleted' && doc.status !== 'archived');
    }
  };

  // Create a wrapper for handleStatusChange to match the expected signature
  const handleStatusChangeWrapper = (doc: BaseDocumentRequest) => {
    // You would need to implement logic to determine the new status
    // For now, we'll just call the original function with a default status
    handleStatusChange(doc.id, doc.status);
  };
  const handleAddNewRequest = (request: Partial<DocumentControllerRequest>) => {
    console.log('New request submitted:', request);
    // Here you would typically handle the request submission
    // For now, we'll just log it
  };
  return <div className="w-full">
      <div className="rounded-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {selectedFilter ? `${selectedFilter === 'live' ? 'Live' : selectedFilter === 'under-review' ? 'Under Review' : selectedFilter === 'pending-approval' ? 'Under Review' : selectedFilter === 'approved' ? 'Approved' : selectedFilter === 'breached' ? 'SLA Breached' : 'Documents'} Documents` : 'Documents'}
          </h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsNewRequestFormOpen(true)} className="text-slate-50 bg-[#117bbc]">
              <Plus className="mr-2 h-4 w-4" />
              Add New Document
            </Button>
            <Button variant="outline" onClick={() => handleExport()} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            {selectedFilter && <Button variant="outline" onClick={() => setShowArchivedDocuments(false)} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                Clear Filter
              </Button>}
          </div>
        </div>
      </div>
      
      {showArchivedDocuments ? <DocumentTable documents={documents.filter(doc => doc.status === 'archived' && (doc.country === selectedCountry || selectedCountry === 'all') && (doc.department === selectedDepartment || selectedDepartment === 'all') && (doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === ''))} filterStatus={selectedFilter || undefined} onSelectDocument={handleDocumentSelect} onDeleteDocument={() => {}} onArchiveDocument={() => {}} onRestoreDocument={handleRestoreDocument} onPushNotification={handlePushNotification} onDownload={handleDownload} onViewDocument={handleViewDocument} userRole={'document-controller'} showRestoreButton={true} hideArchiveDelete={true} hideChangeStatus={true} hideNotification={true} /> : <DocumentTable documents={getFilteredDocs()} filterStatus={selectedFilter || undefined} onSelectDocument={handleDocumentSelect} onDeleteDocument={handleDeleteDocument} onArchiveDocument={handleArchiveDocument} onPushNotification={handlePushNotification} onDownload={handleDownload} onViewDocument={handleViewDocument} userRole={'document-controller'} onStatusChange={handleStatusChangeWrapper} onApproveDocument={handleApproveDocument} onRejectDocument={handleRejectDocument} onQueryDocument={handleQueryDocument} onUploadRevised={handleUploadRevised} />}

      <DocumentControllerRequestForm open={isNewRequestFormOpen} onOpenChange={setIsNewRequestFormOpen} onSubmit={handleAddNewRequest} documents={documents} />

      {/* Floating Filter Panel */}
      <FloatingFilterPanel selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} searchTerm={searchTerm} setSearchTerm={setSearchTerm} documentLevel={documentLevel} setDocumentLevel={setDocumentLevel} />
    </div>;
};