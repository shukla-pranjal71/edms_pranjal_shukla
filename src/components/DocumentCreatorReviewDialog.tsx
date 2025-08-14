
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, MessageSquare } from "lucide-react";
import { DocumentRequest } from './DocumentRequestForm';

interface DocumentCreatorReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentRequest | null;
  onApprove: (document: DocumentRequest) => void;
  onQuery: (document: DocumentRequest, queryReason: string) => void;
}

const DocumentCreatorReviewDialog: React.FC<DocumentCreatorReviewDialogProps> = ({
  open,
  onOpenChange,
  document,
  onApprove,
  onQuery
}) => {
  const [queryReason, setQueryReason] = useState('');
  const [showQueryForm, setShowQueryForm] = useState(false);

  const handleApprove = () => {
    if (document) {
      onApprove(document);
      onOpenChange(false);
      setShowQueryForm(false);
      setQueryReason('');
    }
  };

  const handleQuery = () => {
    if (document && queryReason.trim()) {
      onQuery(document, queryReason);
      onOpenChange(false);
      setShowQueryForm(false);
      setQueryReason('');
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setShowQueryForm(false);
    setQueryReason('');
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{document.sopName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Document Code: {document.documentCode}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Department: {document.department}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Version: {document.versionNumber}</p>
          </div>

          {!showQueryForm ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Please review this document and choose an action:
              </p>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleApprove}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Send to Document Requester
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowQueryForm(true)}
                  className="border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Query & Send back to Document Controller
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="queryReason">Query Reason</Label>
                <Textarea
                  id="queryReason"
                  placeholder="Please provide the reason for querying this document..."
                  value={queryReason}
                  onChange={(e) => setQueryReason(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleQuery}
                  disabled={!queryReason.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Submit Query
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowQueryForm(false);
                    setQueryReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentCreatorReviewDialog;
