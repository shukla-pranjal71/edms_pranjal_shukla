import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentControllerRequestForm from '../DocumentControllerRequestForm';
import { DocumentControllerRequest } from '../DocumentControllerRequestForm';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import { DocumentTable } from '../table';
import UploadDocumentModal from './UploadDocumentModal';
interface DocumentUploadViewProps {
  onAddDocument: (document: Partial<DocumentControllerRequest>) => void;
  documents?: BaseDocumentRequest[];
}
const DocumentUploadView: React.FC<DocumentUploadViewProps> = ({
  onAddDocument,
  documents = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<BaseDocumentRequest[]>([]);
  const handleUploadDocument = (document: Partial<DocumentControllerRequest>) => {
    // Convert DocumentControllerRequest to BaseDocumentRequest for table display
    const baseDocument: BaseDocumentRequest = {
      id: document.documentId || '',
      documentCode: document.documentCode || '',
      sopName: document.documentName || '',
      versionNumber: document.versionNumber || '1.0',
      uploadDate: new Date().toISOString().split('T')[0],
      department: document.department || '',
      status: 'live',
      documentOwners: document.documentOwners || [],
      reviewers: document.reviewers || [],
      documentCreators: document.taskOwners || [],
      complianceNames: document.complianceContacts || [],
      country: document.country || '',
      isBreached: false,
      documentType: document.documentType as any,
      lastRevisionDate: document.lastRevisionDate,
      nextRevisionDate: document.nextRevisionDate,
      fileUrl: document.attachmentUrl,
      createdAt: new Date().toISOString()
    };

    // Add to uploaded documents list
    setUploadedDocuments(prev => [...prev, baseDocument]);

    // Call the original onAddDocument handler
    onAddDocument(document);

    // Close the modal
    setIsModalOpen(false);
  };
  const handleSelectDocument = (doc: BaseDocumentRequest) => {
    console.log('Document selected:', doc);
  };
  const handleDeleteDocument = (doc: BaseDocumentRequest) => {
    setUploadedDocuments(prev => prev.filter(d => d.id !== doc.id));
  };
  const handleArchiveDocument = (doc: BaseDocumentRequest) => {
    console.log('Archive document:', doc);
  };
  const handlePushNotification = (doc: BaseDocumentRequest) => {
    console.log('Push notification for:', doc);
  };
  const handleDownload = (doc: BaseDocumentRequest) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  };
  const handleViewDocument = (doc: BaseDocumentRequest) => {
    console.log('View document:', doc);
  };
  return <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Upload Documents
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload documents directly to Live status, bypassing the workflow cycle.
          </p>
          
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[ffa530] bg-[#117bbc] text-slate-50">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {uploadedDocuments.length > 0 && <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Uploaded Documents
            </h3>
            <DocumentTable documents={uploadedDocuments} onSelectDocument={handleSelectDocument} onDeleteDocument={handleDeleteDocument} onArchiveDocument={handleArchiveDocument} onPushNotification={handlePushNotification} onDownload={handleDownload} onViewDocument={handleViewDocument} userRole="document-controller" showViewButton={true} showDeleteArchive={true} hideNotification={true} />
          </div>}
      </div>

      <UploadDocumentModal open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={handleUploadDocument} documents={documents} />
    </div>;
};
export default DocumentUploadView;