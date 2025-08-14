
import React from 'react';
import { BaseDocumentRequest, UserRole } from '../DocumentTableTypes';
import { usePagination } from './usePagination';
import { useSortableTable } from './useSortableTable';

interface UseDocumentTableProps {
  documents: BaseDocumentRequest[];
  onSelectDocument: (doc: BaseDocumentRequest) => void;
  onDeleteDocument: (doc: BaseDocumentRequest) => void;
  onArchiveDocument: (doc: BaseDocumentRequest) => void;
  onRestoreDocument?: (doc: BaseDocumentRequest) => void;
  onPushNotification: (doc: BaseDocumentRequest) => void;
  onDownload: (doc: BaseDocumentRequest) => void;
  onViewDocument: (doc: BaseDocumentRequest) => void;
  onStatusChange?: (doc: BaseDocumentRequest) => void;
  onApproveDocument?: (doc: BaseDocumentRequest) => void;
  onRejectDocument?: (doc: BaseDocumentRequest) => void;
  onQueryDocument?: (doc: BaseDocumentRequest) => void;
  onUploadRevised?: (doc: BaseDocumentRequest) => void;
  onStartReview?: (doc: BaseDocumentRequest) => void;
  onCreatorReview?: (doc: BaseDocumentRequest) => void;
}

export const useDocumentTable = ({
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
}: UseDocumentTableProps) => {
  
  // Ensure documents is always an array
  const safeDocuments = documents || [];
  
  // Sorting
  const { sortedDocuments, sortColumn, sortDirection, handleSort } = useSortableTable(safeDocuments);
  
  // Pagination - use sortedDocuments length for accurate pagination
  const pagination = usePagination(sortedDocuments.length);
  
  // Get paginated documents from sorted documents
  const paginatedDocuments = pagination.paginateItems(sortedDocuments);

  // Debug logging
  console.log('useDocumentTable - Original documents:', safeDocuments.length);
  console.log('useDocumentTable - Sorted documents:', sortedDocuments.length);
  console.log('useDocumentTable - Paginated documents:', paginatedDocuments.length);
  console.log('useDocumentTable - Current page:', pagination.currentPage);
  console.log('useDocumentTable - Total pages:', pagination.totalPages);

  // Event handlers
  const handleRowClick = (doc: BaseDocumentRequest) => {
    onSelectDocument(doc);
  };

  const handleDelete = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onDeleteDocument(doc);
  };

  const handleArchive = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onArchiveDocument(doc);
  };

  const handleRestore = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onRestoreDocument?.(doc);
  };

  const handleRecover = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    // Implement recovery logic
  };

  const handleView = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onViewDocument(doc);
  };

  const handleViewDetails = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onViewDocument(doc);
  };

  const handlePushNotification = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onPushNotification(doc);
  };

  const handleDownload = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onDownload(doc);
  };

  const handleStatusChange = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onStatusChange?.(doc);
  };

  const handleApprove = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onApproveDocument?.(doc);
  };

  const handleReject = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onRejectDocument?.(doc);
  };

  const handleQuery = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onQueryDocument?.(doc);
  };

  const handleUploadRevised = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onUploadRevised?.(doc);
  };

  const handleStartReview = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onStartReview?.(doc);
  };

  const handleCreatorReview = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    onCreatorReview?.(doc);
  };

  return {
    // Data
    paginatedDocuments,
    
    // Pagination
    ...pagination,
    
    // Sorting
    sortColumn,
    sortDirection,
    handleSort,
    
    // Event handlers
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
  };
};
