
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import DocumentTableRow from './DocumentTableRow';
import DocumentTableHeader from './DocumentTableHeader';
import DocumentEmptyState from './DocumentEmptyState';
import TablePagination from './TablePagination';
import { BaseDocumentRequest, UserRole } from './DocumentTableTypes';
import { useDocumentTable } from './hooks/useDocumentTable';

export interface DocumentTableProps {
  documents: BaseDocumentRequest[];
  filterStatus?: string;
  onSelectDocument: (doc: BaseDocumentRequest) => void;
  onDeleteDocument: (doc: BaseDocumentRequest) => void;
  onArchiveDocument: (doc: BaseDocumentRequest) => void;
  onRestoreDocument?: (doc: BaseDocumentRequest) => void;
  onPushNotification: (doc: BaseDocumentRequest) => void;
  onDownload: (doc: BaseDocumentRequest) => void;
  onViewDocument: (doc: BaseDocumentRequest) => void;
  userRole?: UserRole;
  showViewButton?: boolean;
  showDeleteArchive?: boolean;
  showRestoreButton?: boolean;
  showRecoverButton?: boolean;
  hideArchiveDelete?: boolean;
  hideChangeStatus?: boolean;
  hideNotification?: boolean;
  hideEditButton?: boolean;
  onStatusChange?: (doc: BaseDocumentRequest) => void;
  onApproveDocument?: (doc: BaseDocumentRequest) => void;
  onRejectDocument?: (doc: BaseDocumentRequest) => void;
  onQueryDocument?: (doc: BaseDocumentRequest) => void;
  onUploadRevised?: (doc: BaseDocumentRequest) => void;
  onStartReview?: (doc: BaseDocumentRequest) => void;
  onCreatorReview?: (doc: BaseDocumentRequest) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  filterStatus,
  onSelectDocument,
  onDeleteDocument,
  onArchiveDocument,
  onRestoreDocument,
  onPushNotification,
  onDownload,
  onViewDocument,
  userRole = 'document-controller',
  showViewButton = true,
  showDeleteArchive = true,
  showRestoreButton = false,
  showRecoverButton = false,
  hideArchiveDelete = false,
  hideChangeStatus = false,
  hideNotification = false,
  hideEditButton = false,
  onStatusChange,
  onApproveDocument,
  onRejectDocument,
  onQueryDocument,
  onUploadRevised,
  onStartReview,
  onCreatorReview
}) => {
  const [areExtraColumnsVisible, setAreExtraColumnsVisible] = React.useState(false);
  const toggleExtraColumns = () => setAreExtraColumnsVisible(prev => !prev);
  
  // Debug logging
  console.log('DocumentTable - Received documents:', documents?.length || 0);
  console.log('DocumentTable - Filter status:', filterStatus);
  console.log('DocumentTable - User role:', userRole);
  
  const {
    paginatedDocuments,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    sortColumn,
    sortDirection,
    handleSort,
    handleRowClick,
    handleDelete,
    handleArchive,
    handleRestore,
    handleRecover,
    handleView,
    handleViewDetails,
    handlePushNotification,
    handleDownload,
    handleStatusChange,
    handleApprove,
    handleReject,
    handleQuery,
    handleUploadRevised,
    handleStartReview,
    handleCreatorReview
  } = useDocumentTable({
    documents,
    onSelectDocument,
    onDeleteDocument,
    onArchiveDocument,
    onRestoreDocument,
    onPushNotification,
    onDownload,
    onViewDocument,
    onStatusChange,
    onApproveDocument,
    onRejectDocument,
    onQueryDocument,
    onUploadRevised,
    onStartReview,
    onCreatorReview
  });

  console.log('DocumentTable - Final paginated documents:', paginatedDocuments?.length || 0);

  if (!documents || documents.length === 0) {
    return <DocumentEmptyState />;
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <DocumentTableHeader 
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    areExtraColumnsVisible={areExtraColumnsVisible}
                    onToggleExtraColumns={toggleExtraColumns}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDocuments.map((doc) => (
                  <DocumentTableRow
                    key={doc.id}
                    doc={doc}
                    userRole={userRole}
                    showViewButton={showViewButton}
                    showDeleteArchive={showDeleteArchive}
                    showRestoreButton={showRestoreButton}
                    showRecoverButton={showRecoverButton}
                    hideArchiveDelete={hideArchiveDelete}
                    hideChangeStatus={hideChangeStatus}
                    hideNotification={hideNotification}
                    hideEditButton={hideEditButton}
                    onRowClick={handleRowClick}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onRecover={handleRecover}
                    onView={handleView}
                    onViewDetails={handleViewDetails}
                    onPushNotification={handlePushNotification}
                    onDownload={handleDownload}
                    onStatusChange={handleStatusChange}
                    onApproveDocument={handleApprove}
                    onRejectDocument={handleReject}
                    onQueryDocument={handleQuery}
                    onUploadRevised={handleUploadRevised}
                    onStartReview={handleStartReview}
                    onCreatorReview={handleCreatorReview}
                    areExtraColumnsVisible={areExtraColumnsVisible}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={itemsPerPage}
          onPageSizeChange={setItemsPerPage}
          totalItems={documents.length}
        />
      )}
    </div>
  );
};

export default DocumentTable;
