
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Edit, FileText, MessageSquare, PlayCircle, UserCheck } from "lucide-react";
import { DocumentRequest } from '../DocumentRequestForm';

interface ActionButtonsProps {
  documentData: DocumentRequest;
  userRole?: string;
  showEditButton: () => boolean;
  showStartReviewButton: () => boolean;
  isStartReviewButtonDisabled: () => boolean;
  showReviewButtonBasedOnRole: () => boolean;
  showChangeStatusButton: boolean;
  handleDownload: () => void;
  handleEditDocument?: () => void;
  handleStartReviewClick: () => void;
  handleReviewClick: () => void;
  handleChangeStatus: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  documentData,
  userRole,
  showEditButton,
  showStartReviewButton,
  isStartReviewButtonDisabled,
  showReviewButtonBasedOnRole,
  showChangeStatusButton,
  handleDownload,
  handleEditDocument,
  handleStartReviewClick,
  handleReviewClick,
  handleChangeStatus
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={handleDownload}
        variant="outline"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>

      {showEditButton() && handleEditDocument && (
        <Button 
          onClick={handleEditDocument}
          variant="outline"
          size="sm"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      )}

      {showStartReviewButton() && userRole !== 'admin' && (
        <Button 
          onClick={handleStartReviewClick}
          variant="outline"
          size="sm"
          disabled={isStartReviewButtonDisabled()}
          className={isStartReviewButtonDisabled() ? 'opacity-50 cursor-not-allowed' : ''}
          title={isStartReviewButtonDisabled() ? 'Cannot start review for Live documents' : 'Start Review'}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Start Review
        </Button>
      )}

      {showReviewButtonBasedOnRole() && (
        <Button 
          onClick={handleReviewClick}
          variant="outline"
          size="sm"
        >
          <FileText className="w-4 h-4 mr-2" />
          Review
        </Button>
      )}

      {showChangeStatusButton && (
        <Button 
          onClick={handleChangeStatus}
          variant="outline"
          size="sm"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Change Status
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
