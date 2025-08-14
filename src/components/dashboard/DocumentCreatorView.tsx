import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Plus, Filter, Edit3 } from "lucide-react";
import { DocumentRequest } from '../DocumentRequestForm';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import { documentService } from '@/services/documentService';
import ViewDetailsDialog from '../ViewDetailsDialog';
import DocumentUploadDialog from '../DocumentUploadDialog';
import ReviewUploadDialog from '../ReviewUploadDialog';
import DocumentTable from '../table/DocumentTable';
import TabbedRequestDialog from '../TabbedRequestDialog';
import { ChangeRequest } from '../ChangeRequestForm';
import { NewRequest } from '../NewRequestForm';
import { convertToBaseDocumentRequests } from '@/utils/documentUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateRequestDialog from '../CreateRequestDialog';
import AddNewRequestForm, { NewRequestData } from '../AddNewRequestForm';
import { useToast } from "@/hooks/use-toast";

const DocumentCreatorView = () => {
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showReviewUploadDialog, setShowReviewUploadDialog] = useState(false);
  const [isTabbedRequestDialogOpen, setIsTabbedRequestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("documents");
  const [isCreateRequestDialogOpen, setIsCreateRequestDialogOpen] = useState(false);
  const [isAddNewRequestFormOpen, setIsAddNewRequestFormOpen] = useState(false);
  const [changeRequests] = useState<ChangeRequest[]>([]); // Mock change requests
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const allDocuments = await documentService.getAllDocuments();
      // Filter documents that are pending with Document Creator or created by them
      const creatorDocuments = allDocuments.filter(doc => doc.pendingWith === 'Document Creator' || doc.status === 'under-review' || doc.status === 'queried');
      setDocuments(creatorDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSelect = (document: BaseDocumentRequest) => {
    const docRequest = documents.find(d => d.id === document.id);
    if (docRequest) {
      setSelectedDocument(docRequest);
      setShowDetailsDialog(true);
    }
  };

  const handleViewDocument = (document: BaseDocumentRequest) => {
    const docRequest = documents.find(d => d.id === document.id);
    if (docRequest) {
      setSelectedDocument(docRequest);
      setShowDetailsDialog(true);
    }
  };

  const handleDownload = (document: BaseDocumentRequest) => {
    console.log('Download document:', document);
    // Implement download functionality
  };

  const handleDeleteDocument = async (document: BaseDocumentRequest) => {
    try {
      await documentService.deleteDocument(document.id);
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleArchiveDocument = async (document: BaseDocumentRequest) => {
    try {
      await documentService.archiveDocument(document.id);
      await fetchDocuments();
    } catch (error) {
      console.error('Error archiving document:', error);
    }
  };

  const handlePushNotification = (document: BaseDocumentRequest) => {
    console.log('Push notification for document:', document);
    // Implement notification functionality
  };

  const handleUploadRevision = (document: BaseDocumentRequest) => {
    const docRequest = documents.find(d => d.id === document.id);
    if (docRequest) {
      setSelectedDocument(docRequest);
      setShowUploadDialog(true);
    }
  };

  const handleReviewUpload = (document: BaseDocumentRequest) => {
    const docRequest = documents.find(d => d.id === document.id);
    if (docRequest) {
      setSelectedDocument(docRequest);
      setShowReviewUploadDialog(true);
    }
  };

  const handleApproveDocument = async (documentId: string, approverName: string) => {
    try {
      await documentService.handleCreatorApproval(documentId, approverName);
      await fetchDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleQueryDocument = async (documentId: string, query: string) => {
    try {
      await documentService.handleCreatorQuery(documentId, query);
      await fetchDocuments();
    } catch (error) {
      console.error('Error sending query:', error);
    }
  };

  // Updated handlers for the DocumentTable - fixed to match expected signature
  const handleApproveDocumentFromTable = (doc: BaseDocumentRequest) => {
    handleApproveDocument(doc.id, 'Document Creator');
  };

  const handleQueryDocumentFromTable = (doc: BaseDocumentRequest) => {
    const docRequest = documents.find(d => d.id === doc.id);
    if (docRequest) {
      setSelectedDocument(docRequest);
      setShowDetailsDialog(true);
    }
  };

  const handleCreatorReview = (doc: BaseDocumentRequest) => {
    const docRequest = documents.find(d => d.id === doc.id);
    if (docRequest) {
      setSelectedDocument(docRequest);
      setShowReviewUploadDialog(true);
    }
  };

  const handleTabbedChangeRequestSubmit = (request: Partial<ChangeRequest>, attachment?: File) => {
    console.log('Change request submitted from Document Creator:', request);
    setIsTabbedRequestDialogOpen(false);
  };

  const handleTabbedNewRequestSubmit = (request: Partial<NewRequest>, attachment?: File) => {
    console.log('New request submitted from Document Creator:', request);
    setIsTabbedRequestDialogOpen(false);
  };

  const handleAddNewRequestSubmit = (request: Partial<NewRequestData>) => {
    console.log('Add New Request submitted:', request);
    // Handle the add new request submission logic here
    toast({
      title: "Request Submitted",
      description: "Your request has been submitted successfully.",
    });
  };

  const baseDocuments = convertToBaseDocumentRequests(documents);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading documents...</div>
      </div>;
  }

  return <div className="space-y-6">
      {/* Header with Add New Request Button */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Document Creator Dashboard</CardTitle>
              <CardDescription>Manage your document creation tasks</CardDescription>
            </div>
            <Button onClick={() => setIsTabbedRequestDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Document
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for Documents and Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>
                All documents ({documents.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? <div className="text-center py-8">
                  <p className="text-gray-500">No documents assigned to you as Document Creator.</p>
                </div> : <DocumentTable documents={baseDocuments} onSelectDocument={handleDocumentSelect} onDeleteDocument={handleDeleteDocument} onArchiveDocument={handleArchiveDocument} onDownload={handleDownload} onPushNotification={handlePushNotification} onViewDocument={handleViewDocument} onApproveDocument={handleApproveDocumentFromTable} onQueryDocument={handleQueryDocumentFromTable} onCreatorReview={handleCreatorReview} userRole="document-creator" showDeleteArchive={false} hideNotification={true} hideEditButton={true} hideArchiveDelete={true} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Requests</CardTitle>
                  <CardDescription>Manage your document requests</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddNewRequestFormOpen(true)} variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Request
                  </Button>
                  <Button onClick={() => setIsCreateRequestDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Request
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Your change requests will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tabbed Request Dialog */}
      <TabbedRequestDialog
        open={isTabbedRequestDialogOpen}
        onOpenChange={setIsTabbedRequestDialogOpen}
        onSubmitChangeRequest={handleTabbedChangeRequestSubmit}
        onSubmitNewRequest={handleTabbedNewRequestSubmit}
        documents={baseDocuments}
      />

      {/* Create Request Dialog */}
      <CreateRequestDialog
        open={isCreateRequestDialogOpen}
        onOpenChange={setIsCreateRequestDialogOpen}
        documents={baseDocuments}
      />

      {/* Add New Request Form */}
      <AddNewRequestForm
        open={isAddNewRequestFormOpen}
        onOpenChange={setIsAddNewRequestFormOpen}
        onSubmit={handleAddNewRequestSubmit}
      />

      {/* Other Dialogs */}
      {selectedDocument && <>
          <ViewDetailsDialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog} document={{
        ...selectedDocument,
        uploadDate: selectedDocument.uploadDate || selectedDocument.createdAt || new Date().toISOString()
      } as BaseDocumentRequest} userRole="document-creator" onApproveDocument={() => {
        handleApproveDocument(selectedDocument.id, 'Document Creator');
        setShowDetailsDialog(false);
      }} onQueryDocument={(query: string) => {
        handleQueryDocument(selectedDocument.id, query);
        setShowDetailsDialog(false);
      }} />
          
          <DocumentUploadDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} document={{
        ...selectedDocument,
        uploadDate: selectedDocument.uploadDate || selectedDocument.createdAt || new Date().toISOString()
      } as BaseDocumentRequest} onUpdateComplete={() => {
        setShowUploadDialog(false);
        fetchDocuments();
      }} />
          
          <ReviewUploadDialog open={showReviewUploadDialog} onOpenChange={setShowReviewUploadDialog} documentName={selectedDocument.sopName} documentId={selectedDocument.id} onUploadComplete={() => {
        setShowReviewUploadDialog(false);
        fetchDocuments();
      }} />
        </>}
    </div>;
};

export default DocumentCreatorView;
