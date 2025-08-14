
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DocumentControllerRequestForm from '../DocumentControllerRequestForm';
import { DocumentControllerRequest } from '../DocumentControllerRequestForm';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (document: Partial<DocumentControllerRequest>) => void;
  documents: BaseDocumentRequest[];
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  documents
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <DocumentControllerRequestForm
          open={true}
          onOpenChange={() => {}} // Always open in this modal
          onSubmit={onSubmit}
          documents={documents}
          isUploadMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;
