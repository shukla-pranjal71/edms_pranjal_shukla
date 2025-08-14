
import React from 'react';
import { BaseDocumentRequest } from '../DocumentTableTypes';

export const useDocumentHandlers = (
  onDeleteDocument: (doc: BaseDocumentRequest) => void,
  onArchiveDocument: (doc: BaseDocumentRequest) => void,
  onRestoreDocument?: (doc: BaseDocumentRequest) => void,
  onRecoverDocument?: (doc: BaseDocumentRequest) => void,
  onViewDocument?: (doc: BaseDocumentRequest) => void,
  onDownload?: (doc: BaseDocumentRequest) => void,
  onPushNotification?: (doc: BaseDocumentRequest) => void,
  onStatusChange?: (doc: BaseDocumentRequest) => void,
  onStartReview?: (doc: BaseDocumentRequest) => void,
  onReviewDocument?: (doc: BaseDocumentRequest) => void,
  onUploadRevised?: (doc: BaseDocumentRequest) => void,
  onPushToLive?: (doc: BaseDocumentRequest) => void
) => {
  
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
    if (onRestoreDocument) {
      onRestoreDocument(doc);
    }
  };

  const handleRecover = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onRecoverDocument) {
      onRecoverDocument(doc);
    }
  };

  const handleView = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onViewDocument) {
      onViewDocument(doc);
    }
  };

  const handlePushNotification = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onPushNotification) {
      onPushNotification(doc);
    }
  };

  const handleDownload = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(doc);
    }
  };

  const handleStatusChange = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(doc);
    }
  };

  const handleStartReview = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onStartReview) {
      onStartReview(doc);
    }
  };
  
  const handleReviewDocument = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onReviewDocument) {
      onReviewDocument(doc);
    }
  };
  
  const handleUploadRevised = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onUploadRevised) {
      onUploadRevised(doc);
    }
  };
  
  const handlePushToLive = (e: React.MouseEvent, doc: BaseDocumentRequest) => {
    e.stopPropagation();
    if (onPushToLive) {
      onPushToLive(doc);
    }
  };

  return {
    handleDelete,
    handleArchive,
    handleRestore,
    handleRecover,
    handleView,
    handlePushNotification,
    handleDownload,
    handleStatusChange,
    handleStartReview,
    handleReviewDocument,
    handleUploadRevised,
    handlePushToLive
  };
};
