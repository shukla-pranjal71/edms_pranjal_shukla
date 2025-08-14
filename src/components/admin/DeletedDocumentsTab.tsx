import React from 'react';
import { Button } from "@/components/ui/button";
import { File } from 'lucide-react';
import { DocumentTable } from "@/components/table";
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';
interface DeletedDocumentsTabProps {
  deletedDocuments: BaseDocumentRequest[];
  handleExportDocuments: () => void;
  handleViewDocument: (document: BaseDocumentRequest) => void;
  handleRestoreDocument: (document: BaseDocumentRequest) => void;
}
export const DeletedDocumentsTab: React.FC<DeletedDocumentsTabProps> = ({
  deletedDocuments,
  handleExportDocuments,
  handleViewDocument,
  handleRestoreDocument
}) => {
  // Add empty handler functions for required props
  const handleDeleteDocument = () => {}; // Empty function since this is hidden
  const handleArchiveDocument = () => {}; // Empty function since this is hidden
  const handleDownload = (doc: BaseDocumentRequest) => {}; // Empty download function
  const handlePushNotification = (doc: BaseDocumentRequest) => {}; // Empty notification function

  return <div className="h-full w-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        
        <Button onClick={handleExportDocuments} variant="outline" className="flex items-center gap-2">
          <File size={18} />
          Export
        </Button>
      </div>
      
      <div className="flex-1 min-h-0">
        <DocumentTable documents={deletedDocuments} filterStatus="deleted" onSelectDocument={handleViewDocument} onDeleteDocument={handleDeleteDocument} onArchiveDocument={handleArchiveDocument} onDownload={handleDownload} onPushNotification={handlePushNotification} onRestoreDocument={handleRestoreDocument} onViewDocument={handleViewDocument} showRecoverButton={true} showDeleteArchive={false} />
      </div>
    </div>;
};