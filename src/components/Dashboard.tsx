import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardCards } from './dashboard/DashboardCards';
import { DocumentControllerView } from './dashboard/DocumentControllerView';
import DocumentControllerPendingView from './dashboard/DocumentControllerPendingView';
import DocumentUploadView from './dashboard/DocumentUploadView';
import { RequesterView } from './dashboard/RequesterView';
import { DashboardDialogs } from './dashboard/DashboardDialogs';
import { TakeActionDialog } from './TakeActionDialog';
import DocControllerSidebar from './DocControllerSidebar';
import DocumentCreatorReviewDialog from './DocumentCreatorReviewDialog';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DocumentViewer from './DocumentViewer';

import { DocumentRequest, DocumentStatus } from './DocumentRequestForm';
import { DocumentControllerRequest } from './DocumentControllerRequestForm';
import { BaseDocumentRequest } from './table/DocumentTableTypes';
import { Person } from './PeopleField';
import { AdminConfig } from './AdminConfigDialog';
import { ChangeRequest, ChangeRequestStatus } from './ChangeRequestForm';
import { UserRole } from './table/DocumentTableTypes';

import { notificationService } from '../utils/notificationService';
import { 
  convertToDocumentRequests, 
  safeDocumentStatus, 
  ensureBaseDocumentRequestType,
  convertDocumentRequestToBase,
  convertToBaseDocumentRequests
} from '../utils/documentUtils';
import { exportToExcel } from '../utils/exportUtils';
import { getFilteredDocuments, getArchivedDocuments, getDisplayDocuments } from '../utils/documentFilterUtils';

// Dashboard hooks
import { useDashboardState } from '../hooks/useDashboardState';
import { useDashboardHandlers } from '../hooks/useDashboardHandlers';
import RequestTypeSelectionDialog from './RequestTypeSelectionDialog';
import NewRequestForm, { NewRequest } from './NewRequestForm';

import TabbedRequestDialog from './TabbedRequestDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Additional state for take action functionality
  const [isTakeActionOpen, setIsTakeActionOpen] = useState(false);
  const [selectedDocumentForAction, setSelectedDocumentForAction] = useState<DocumentRequest | null>(null);
  
  // Document Creator specific state
  const [isCreatorReviewOpen, setIsCreatorReviewOpen] = useState(false);
  const [selectedDocumentForCreatorReview, setSelectedDocumentForCreatorReview] = useState<DocumentRequest | null>(null);
  
  // Document Controller specific state - now used by all roles
  const [activeControllerTab, setActiveControllerTab] = useState<string>('documents');
  
  // Document popup state
  const [isDocumentPopupOpen, setIsDocumentPopupOpen] = useState(false);
  
  // Add document level state
  const [documentLevel, setDocumentLevel] = useState<string>('all');

  // New request type selection state
  const [isRequestTypeSelectionOpen, setIsRequestTypeSelectionOpen] = useState(false);
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = useState(false);

  // State management - using custom hook
  const {
    documents, setDocuments,
    selectedDocument, setSelectedDocument,
    isFormOpen, setIsFormOpen,
    selectedFilter, setSelectedFilter,
    adminConfig, setAdminConfig,
    isReviewPromptOpen, setIsReviewPromptOpen,
    isReviewerSelectionOpen, setIsReviewerSelectionOpen,
    isDocumentUploadOpen, setIsDocumentUploadOpen,
    isApprovalDialogOpen, setIsApprovalDialogOpen,
    isAdminConfigOpen, setIsAdminConfigOpen,
    isReviewUploadOpen, setIsReviewUploadOpen,
    isDocumentApprovalOpen, setIsDocumentApprovalOpen,
    showDetailsDialog, setShowDetailsDialog,
    showArchivedDocuments, setShowArchivedDocuments,
    currentUserRole, setCurrentUserRole,
    selectedCountry, setSelectedCountry,
    selectedDepartment, setSelectedDepartment,
    searchTerm, setSearchTerm,
    archivedSearchTerm, setArchivedSearchTerm,
    showChangeRequests, setShowChangeRequests,
    changeRequests, setChangeRequests,
    isChangeRequestFormOpen, setIsChangeRequestFormOpen,
    selectedChangeRequest, setSelectedChangeRequest,
    isChangeRequestDetailsOpen, setIsChangeRequestDetailsOpen,
    isLoading
  } = useDashboardState();
  
  // Handler functions - using custom hook
  const {
    handleLogout,
    handleFilterClick,
    handleRestoreDocument,
    handleDownload,
    handleViewDocument,
    handleDocumentSelect,
    handleDeleteDocument,
    handleArchiveDocument,
    handleReviewDocument,
    handlePushNotification,
    handleUploadRevised,
    handlePushToLive,
    handleAddDocument,
    handleStartReview,
    handleSelectReviewers,
    handleUploadDocument,
    handleApproveDocument,
    handleRejectDocument,
    handleOwnerQueryDocument,
    handleSaveAdminConfig,
    handleStatusChange,
    handleExport,
    handleViewChangeRequest,
    handleCancelChangeRequest,
    handleAddChangeRequest,
    handleEditDocument
  } = useDashboardHandlers({
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    toast: (props: any) => '', // Fixed toast function to return empty string
    setIsFormOpen,
    setShowDetailsDialog,
    setIsReviewPromptOpen,
    setIsReviewUploadOpen,
    adminConfig,
    setIsReviewerSelectionOpen,
    setIsApprovalDialogOpen,
    setIsDocumentApprovalOpen,
    changeRequests,
    setChangeRequests,
    setSelectedChangeRequest,
    setIsChangeRequestDetailsOpen,
    setIsChangeRequestFormOpen,
    selectedFilter,
    setSelectedFilter,
    showChangeRequests,
    setShowChangeRequests
  });

  const handleAddDocumentUpload = (documentRequest: Partial<DocumentControllerRequest>) => {
    // Convert the document request to DocumentRequest format
    const newDocument: DocumentRequest = {
      id: documentRequest.documentId || '',
      sopName: documentRequest.documentName || '',
      documentCode: documentRequest.documentCode || '',
      country: documentRequest.country || '',
      lastRevisionDate: documentRequest.lastRevisionDate || '',
      nextRevisionDate: documentRequest.nextRevisionDate || '',
      versionNumber: documentRequest.versionNumber || '',
      status: 'live' as DocumentStatus, // Always set to live for upload mode
      uploadDate: new Date().toISOString().split('T')[0],
      documentOwners: documentRequest.documentOwners || [],
      reviewers: documentRequest.reviewers || [],
      complianceNames: documentRequest.complianceContacts || [],
      documentCreators: [],
      department: documentRequest.department || '',
      documentType: (documentRequest.documentType as any) || 'SOP',
      documentLanguage: documentRequest.documentLanguage,
      description: documentRequest.description,
      attachmentName: documentRequest.attachmentName,
      fileUrl: documentRequest.attachmentUrl,
      createdAt: new Date().toISOString(),
      isBreached: false
    };

    setDocuments(prevDocs => [...prevDocs, newDocument]);
    console.log('Document uploaded directly to Live status:', newDocument);
  };

  const handleTakeAction = (document: DocumentRequest) => {
    setSelectedDocumentForAction(document);
    setIsTakeActionOpen(true);
  };

  const handleTakeActionSubmit = (updatedDocument: DocumentRequest, metadata: any) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );
    
    setSelectedDocumentForAction(null);
  };

  const handleCreatorReview = (document: BaseDocumentRequest) => {
    const documentRequest = convertBaseToDocumentRequest(document);
    setSelectedDocumentForCreatorReview(documentRequest);
    setIsCreatorReviewOpen(true);
  };

  const handleCreatorApproval = async (document: DocumentRequest) => {
    try {
      const updatedDocument = {
        ...document,
        pendingWith: 'Document Requester'
      };
      
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === document.id ? updatedDocument : doc
        )
      );
      
      setSelectedDocumentForCreatorReview(null);
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleCreatorQuery = async (document: DocumentRequest, queryReason: string) => {
    try {
      const updatedDocument = {
        ...document,
        status: 'queried' as DocumentStatus,
        pendingWith: 'Document Controller',
        comments: [...(document.comments || []), `Query from Document Creator: ${queryReason}`]
      };
      
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === document.id ? updatedDocument : doc
        )
      );
      
      setSelectedDocumentForCreatorReview(null);
    } catch (error) {
      console.error('Error querying document:', error);
    }
  };

  const handleControllerTabChange = (tab: string) => {
    setActiveControllerTab(tab);
    setSelectedFilter(null);
    if (tab !== 'archived') {
      setShowArchivedDocuments(false);
    }
  };

  const handleArchivedClick = () => {
    // Only allow archived access for document controllers
    if (currentUserRole === 'document-controller') {
      setActiveControllerTab('archived');
      setShowArchivedDocuments(true);
      setSelectedFilter(null);
    }
  };

  const handleAddDocumentWithRole = (document: DocumentRequest) => {
    handleAddDocument(document);
  };

  const handleFilterClickWrapper = (filter: string) => {
    if (filter === selectedFilter) {
      setSelectedFilter(null);
    } else {
      setSelectedFilter(filter);
    }
    
    handleFilterClick(filter);
  };

  const handleDocumentSelectWithPopup = (doc: BaseDocumentRequest) => {
    const documentRequest = convertBaseToDocumentRequest(doc);
    setSelectedDocument(documentRequest);
    setIsDocumentPopupOpen(true);
  };

  const convertBaseToDocumentRequest = (doc: BaseDocumentRequest): DocumentRequest => {
    return {
      ...doc,
      uploadDate: doc.uploadDate,
      createdAt: doc.createdAt || new Date().toISOString(),
      lastRevisionDate: doc.lastRevisionDate || new Date().toISOString().split('T')[0],
      nextRevisionDate: doc.nextRevisionDate || (() => {
        const nextDate = new Date();
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        return nextDate.toISOString().split('T')[0];
      })(),
      status: doc.status as DocumentStatus,
      documentType: doc.documentType || 'SOP',
      complianceContacts: []
    };
  };

  const [isTabbedRequestDialogOpen, setIsTabbedRequestDialogOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole | null;
    if (savedRole) {
      setCurrentUserRole(savedRole);
    }
    if (savedRole === 'admin') {
      navigate('/admin');
    }
  }, [navigate]);
  
  useEffect(() => {
    if (!isLoading && documents.length > 0) {
      const today = new Date();
      const updatedDocuments = documents.map(doc => {
        const docWithCreatedAt = {
          ...doc,
          createdAt: doc.createdAt || new Date().toISOString()
        };
        
        if (doc.status === 'under-review' && doc.reviewDeadline) {
          const deadline = new Date(doc.reviewDeadline);
          const isBreached = today > deadline;
          if (isBreached !== doc.isBreached) {
            return {
              ...docWithCreatedAt,
              isBreached
            };
          }
        }
        return docWithCreatedAt;
      });

      setDocuments(updatedDocuments);
      notificationService.checkAndSendReviewNotifications();
    }
  }, [isLoading, documents.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 text-[#ffa530] animate-spin mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading documents...</p>
      </div>
    );
  }

  const documentRequestsWithCreatedAt = documents.map(doc => ({
    ...doc,
    createdAt: doc.createdAt || new Date().toISOString()
  }));
  
  const documentRequestsToBase = convertToBaseDocumentRequests(documentRequestsWithCreatedAt);

  const handleExportWrapper = () => {
    handleExport(documentRequestsToBase);
  };

  const handleTakeActionForPendingView = (doc: DocumentRequest) => {
    handleTakeAction(doc);
  };

  const handleViewDocumentForPendingView = (doc: DocumentRequest) => {
    const baseDoc = ensureBaseDocumentRequestType(doc);
    handleViewDocument(baseDoc);
  };

  // Updated handler for Add New Request button - only for certain roles
  const handleAddNewRequest = () => {
    console.log('Add New Request clicked, current user role:', currentUserRole);
    
    // For document controllers, show the original form
    if (currentUserRole === 'document-controller') {
      console.log('Opening document controller form');
      setIsFormOpen(true);
    } else if (currentUserRole === 'requester') {
      // For requester role, show request type selection
      console.log('Opening request type selection for role:', currentUserRole);
      setIsRequestTypeSelectionOpen(true);
    }
    // Removed the tabbed dialog case for document-owner, reviewer, and document-creator
  };

  const handleTabbedChangeRequestSubmit = (request: Partial<ChangeRequest>, attachment?: File) => {
    console.log('Change request submitted to Document Owner dashboard:', request);
    // Set status to pending-owner-approval to route to Document Owner first
    const requestWithStatus = {
      ...request,
      status: 'pending-owner-approval' as ChangeRequestStatus
    };
    handleAddChangeRequest(requestWithStatus);
    setIsTabbedRequestDialogOpen(false);
  };

  const handleTabbedNewRequestSubmit = (request: Partial<NewRequest>, attachment?: File) => {
    console.log('New request submitted to Document Owner dashboard:', request);
    // Set status to pending-owner-approval to route to Document Owner first
    const requestWithStatus = {
      ...request,
      status: 'pending-owner-approval' as const
    };
    handleNewRequestSubmit(requestWithStatus, attachment);
    setIsTabbedRequestDialogOpen(false);
  };

  const handleSelectChangeRequest = () => {
    setIsRequestTypeSelectionOpen(false);
    setIsChangeRequestFormOpen(true);
  };

  const handleSelectNewRequest = () => {
    setIsRequestTypeSelectionOpen(false);
    setIsNewRequestFormOpen(true);
  };

  const handleNewRequestSubmit = (request: Partial<NewRequest>, attachment?: File) => {
    console.log('New request submitted:', request);
    // Here you would typically send this to the Document Owner's dashboard
    // For now, we'll just close the form and show a success message
    setIsNewRequestFormOpen(false);
  };

  const shouldShowAddButton = () => {
    // Only show the Add New Request button for document-controller and requester roles
    return currentUserRole === 'document-controller' || currentUserRole === 'requester';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* App header */}
      <DashboardHeader
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        documentLevel={documentLevel}
        setDocumentLevel={setDocumentLevel}
        handleLogout={handleLogout}
        setIsFormOpen={shouldShowAddButton() ? handleAddNewRequest : undefined}
        currentUserRole={currentUserRole}
      />

      {/* Main content area with sidebar for all roles (standardized) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Unified Sidebar - now used by all roles */}
        <DocControllerSidebar
          activeTab={showArchivedDocuments ? 'archived' : activeControllerTab}
          onTabChange={handleControllerTabChange}
          onArchivedClick={handleArchivedClick}
          userRole={currentUserRole}
        />

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats cards - only show for non-pending and non-upload tabs */}
          {activeControllerTab !== 'pending' && activeControllerTab !== 'upload' && (
            <DashboardCards
              documents={documents}
              selectedCountry={selectedCountry}
              selectedDepartment={selectedDepartment}
              searchTerm={searchTerm}
              selectedFilter={selectedFilter}
              currentUserRole={currentUserRole}
              handleFilterClick={handleFilterClickWrapper}
              showChangeRequests={showChangeRequests}
              setShowChangeRequests={setShowChangeRequests}
              changeRequests={changeRequests}
            />
          )}
          
          {/* Document viewer */}
          {selectedDocument && (
            <DocumentViewer 
              document={selectedDocument} 
              onReview={() => setIsReviewPromptOpen(true)} 
              showReviewButton={currentUserRole === 'requester' || currentUserRole === 'document-owner'} 
              userRole={currentUserRole} 
              onStatusChange={() => {
                if (selectedDocument) {
                  handleStatusChange(selectedDocument.id, selectedDocument.status);
                }
              }}
              onEditDocument={handleEditDocument}
              onQueryDocument={handleOwnerQueryDocument}
            />
          )}

          {/* Upload Documents Tab */}
          {activeControllerTab === 'upload' && currentUserRole === 'document-controller' && (
            <DocumentUploadView
              onAddDocument={handleAddDocumentUpload}
              documents={documentRequestsToBase}
            />
          )}

          {/* Standardized Views - All roles now use the same layout structure */}
          {activeControllerTab === 'pending' && (
             <DocumentControllerPendingView
               documents={documents}
               onTakeAction={(doc: DocumentRequest) => handleTakeAction(doc)}
               onViewDocument={(doc: DocumentRequest) => {
                 const baseDoc = ensureBaseDocumentRequestType(doc);
                 handleViewDocument(baseDoc);
               }}
             />
          )}

          {(activeControllerTab === 'documents' || showArchivedDocuments) && (
            <DocumentControllerView
              documents={documentRequestsToBase}
              selectedCountry={selectedCountry}
              selectedDepartment={selectedDepartment}
              searchTerm={searchTerm}
              selectedFilter={selectedFilter}
              showArchivedDocuments={showArchivedDocuments}
              setShowArchivedDocuments={setShowArchivedDocuments}
              handleDocumentSelect={handleDocumentSelectWithPopup}
              handleDownload={handleDownload}
              handleViewDocument={handleViewDocument}
              handleExport={() => handleExport(documentRequestsToBase)}
              handleDeleteDocument={handleDeleteDocument}
              handleArchiveDocument={handleArchiveDocument}
              handleRestoreDocument={handleRestoreDocument}
              handlePushNotification={handlePushNotification}
              handleStatusChange={handleStatusChange}
              handleApproveDocument={(doc: BaseDocumentRequest) => {
                const documentRequest = convertBaseToDocumentRequest(doc);
                setSelectedDocument(documentRequest);
                handleApproveDocument();
              }}
              handleRejectDocument={(doc: BaseDocumentRequest) => {
                const documentRequest = convertBaseToDocumentRequest(doc);
                setSelectedDocument(documentRequest);
                setIsApprovalDialogOpen(true);
              }}
              handleQueryDocument={(doc: BaseDocumentRequest) => {
                const documentRequest = convertBaseToDocumentRequest(doc);
                setSelectedDocument(documentRequest);
                console.log('Query document:', doc);
              }}
              handleUploadRevised={handleUploadRevised}
              setSelectedCountry={setSelectedCountry}
              setSelectedDepartment={setSelectedDepartment}
              setSearchTerm={setSearchTerm}
              documentLevel={documentLevel}
              setDocumentLevel={setDocumentLevel}
            />
          )}

          {/* Special handling for Requester role - still show change requests when needed */}
          {currentUserRole === 'requester' && showChangeRequests && (
            <RequesterView
              documents={documentRequestsToBase}
              selectedCountry={selectedCountry}
              selectedDepartment={selectedDepartment}
              searchTerm={searchTerm}
              selectedFilter={selectedFilter}
              showChangeRequests={showChangeRequests}
              setShowChangeRequests={setShowChangeRequests}
              setIsChangeRequestFormOpen={setIsChangeRequestFormOpen}
              handleDocumentSelect={handleDocumentSelectWithPopup}
              handleDownload={handleDownload}
              handleViewDocument={handleViewDocument}
              handleViewChangeRequest={handleViewChangeRequest}
              handleCancelChangeRequest={handleCancelChangeRequest}
              changeRequests={changeRequests}
              setSelectedFilter={setSelectedFilter}
              setDocuments={(docs: BaseDocumentRequest[]) => {
                const convertedDocuments = docs.map(doc => convertBaseToDocumentRequest(doc));
                setDocuments(convertedDocuments);
              }}
              isChangeRequestFormOpen={isChangeRequestFormOpen}
              onAddChangeRequest={handleAddChangeRequest}
            />
          )}
        </div>
      </div>

      {/* Document Popup Dialog */}
      <Dialog open={isDocumentPopupOpen} onOpenChange={setIsDocumentPopupOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          {selectedDocument && (
            <DocumentViewer 
              document={selectedDocument} 
              onReview={() => setIsReviewPromptOpen(true)} 
              showReviewButton={currentUserRole === 'requester' || currentUserRole === 'document-owner'} 
              userRole={currentUserRole} 
              onStatusChange={() => {
                if (selectedDocument) {
                  handleStatusChange(selectedDocument.id, selectedDocument.status);
                }
              }}
              onEditDocument={handleEditDocument}
              onQueryDocument={handleOwnerQueryDocument}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Request Type Selection Dialog */}
      <RequestTypeSelectionDialog
        open={isRequestTypeSelectionOpen}
        onOpenChange={setIsRequestTypeSelectionOpen}
        onSelectChangeRequest={handleSelectChangeRequest}
        onSelectNewRequest={handleSelectNewRequest}
      />

      {/* New Request Form */}
      <NewRequestForm
        open={isNewRequestFormOpen}
        onOpenChange={setIsNewRequestFormOpen}
        onSubmit={handleNewRequestSubmit}
      />

      {/* Tabbed Request Dialog - for Document Owner, Reviewer, and Creator */}
      <TabbedRequestDialog
        open={isTabbedRequestDialogOpen}
        onOpenChange={setIsTabbedRequestDialogOpen}
        onSubmitChangeRequest={handleTabbedChangeRequestSubmit}
        onSubmitNewRequest={handleTabbedNewRequestSubmit}
        documents={documentRequestsToBase}
      />

      {/* Dialogs */}
      <DashboardDialogs
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        handleAddDocument={handleAddDocumentWithRole}
        documents={documents}
        selectedDocument={selectedDocument}
        showDetailsDialog={showDetailsDialog}
        setShowDetailsDialog={setShowDetailsDialog}
        isReviewPromptOpen={isReviewPromptOpen}
        setIsReviewPromptOpen={setIsReviewPromptOpen}
        isReviewerSelectionOpen={isReviewerSelectionOpen}
        setIsReviewerSelectionOpen={setIsReviewerSelectionOpen}
        isDocumentUploadOpen={isDocumentUploadOpen}
        setIsDocumentUploadOpen={setIsDocumentUploadOpen}
        isApprovalDialogOpen={isApprovalDialogOpen}
        setIsApprovalDialogOpen={setIsApprovalDialogOpen}
        isReviewUploadOpen={isReviewUploadOpen}
        setIsReviewUploadOpen={setIsReviewUploadOpen}
        isDocumentApprovalOpen={isDocumentApprovalOpen}
        setIsDocumentApprovalOpen={setIsDocumentApprovalOpen}
        isAdminConfigOpen={isAdminConfigOpen}
        setIsAdminConfigOpen={setIsAdminConfigOpen}
        handleStartReview={handleStartReview}
        handleSelectReviewers={handleSelectReviewers}
        handleUploadDocument={() => console.log('Upload document dialog opened')}
        handleApproveDocument={handleApproveDocument}
        handleRejectDocument={handleRejectDocument}
        handleOwnerQueryDocument={handleOwnerQueryDocument}
        handleSaveAdminConfig={handleSaveAdminConfig}
        currentUserRole={currentUserRole}
        adminConfig={adminConfig}
        isChangeRequestFormOpen={isChangeRequestFormOpen}
        setIsChangeRequestFormOpen={setIsChangeRequestFormOpen}
        handleAddChangeRequest={handleAddChangeRequest}
        selectedChangeRequest={selectedChangeRequest}
        isChangeRequestDetailsOpen={isChangeRequestDetailsOpen}
        setIsChangeRequestDetailsOpen={setIsChangeRequestDetailsOpen}
      />

      {/* Document Creator Review Dialog */}
      <DocumentCreatorReviewDialog
        open={isCreatorReviewOpen}
        onOpenChange={setIsCreatorReviewOpen}
        document={selectedDocumentForCreatorReview}
        onApprove={handleCreatorApproval}
        onQuery={handleCreatorQuery}
      />

      {/* Take Action Dialog */}
      <TakeActionDialog
        open={isTakeActionOpen}
        onOpenChange={setIsTakeActionOpen}
        document={selectedDocumentForAction}
        onSubmit={handleTakeActionSubmit}
      />
    </div>
  );
};

export default Dashboard;
