
import React from 'react';
import { Button } from "@/components/ui/button";
import { File } from 'lucide-react';
import { DocumentTable } from "@/components/table";
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';

interface ArchivedDocumentsTabProps {
  archivedDocuments: BaseDocumentRequest[];
  handleExportDocuments: () => void;
  handleViewDocument: (document: BaseDocumentRequest) => void;
  handleRestoreDocument: (document: BaseDocumentRequest) => void;
}

export const ArchivedDocumentsTab: React.FC<ArchivedDocumentsTabProps> = ({
  archivedDocuments,
  handleExportDocuments,
  handleViewDocument,
  handleRestoreDocument
}) => {
  // Add empty handler functions for required props
  const handleDeleteDocument = () => {}; // Empty function since this is hidden
  const handleArchiveDocument = () => {}; // Empty function since this is hidden
  const handleDownload = (doc: BaseDocumentRequest) => {}; // Empty download function
  const handlePushNotification = (doc: BaseDocumentRequest) => {}; // Empty notification function

  return (
    <div className="h-full w-full flex flex-col">
      {/* Hide dashboard cards - no cards section here */}
      
      {/* Header with only export button - no add new document button */}
      <div className="flex justify-between items-center mb-6 px-6 pt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Archived Documents
        </h2>
        <Button onClick={handleExportDocuments} variant="outline" className="flex items-center gap-2">
          <File size={18} />
          Export
        </Button>
      </div>
      
      <div className="flex-1 min-h-0 px-6 pb-6">
        <DocumentTable 
          documents={archivedDocuments} 
          filterStatus="archived" 
          onSelectDocument={handleViewDocument} 
          onDeleteDocument={handleDeleteDocument} 
          onArchiveDocument={handleArchiveDocument} 
          onDownload={handleDownload} 
          onPushNotification={handlePushNotification} 
          onRestoreDocument={handleRestoreDocument} 
          onViewDocument={handleViewDocument} 
          showRestoreButton={true} 
          showDeleteArchive={false} 
        />
      </div>
    </div>
  );
};
