import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, MessageSquare, CheckCircle, RefreshCcw } from 'lucide-react';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import { FileService } from '@/services/fileService';
import { useToastNotifications } from '@/hooks/document/useToastNotifications';
interface FullScreenDocumentViewProps {
  document: BaseDocumentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: () => void;
  showReviewButton?: boolean;
  showChangeStatusButton?: boolean;
  showReviewQueryButton?: boolean;
  showDocumentOwnerActions?: boolean;
  onStatusChange?: () => void;
  onReviewClick?: () => void;
  userRole?: string;
}
export const FullScreenDocumentView: React.FC<FullScreenDocumentViewProps> = ({
  document,
  open,
  onOpenChange,
  onDownload,
  showReviewButton,
  showChangeStatusButton,
  showReviewQueryButton,
  showDocumentOwnerActions,
  onStatusChange,
  onReviewClick,
  userRole
}) => {
  const {
    showInfoToast
  } = useToastNotifications();
  const isApproved = document.status === 'approved';
  const handleDownload = async () => {
    try {
      if (onDownload) {
        onDownload();
      } else if (document.fileUrl) {
        // Use the file service to download the file as Word
        await FileService.downloadFile(document.fileUrl, `${document.documentCode}-v${document.versionNumber}.docx`);
        showInfoToast("Download started", "Your document will download shortly");
      } else if (document.documentUrl) {
        // Fallback to documentUrl if fileUrl is not available
        await FileService.downloadFile(document.documentUrl, `${document.documentCode}-v${document.versionNumber}.docx`);
        showInfoToast("Download started", "Your document will download shortly");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">{document.sopName}</h2>
            
          </div>
          
          {/* Document viewer */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Document Code</p>
                  <p>{document.documentCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p>{document.versionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p>{document.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p>{document.status}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Document Preview</p>
                <div className="border rounded-md p-4 mt-2 h-[400px] flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400">Document preview would be displayed here</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-4 border-t flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            
            {showReviewButton && !isApproved && <Button onClick={onReviewClick} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Review
              </Button>}
            
            {/* Only show Change Status button for document controllers when document is in approved status */}
            {showChangeStatusButton && isApproved && userRole === 'document-controller' && <Button onClick={onStatusChange} className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Change Status
              </Button>}
            
            {showReviewQueryButton && !isApproved && <Button variant="outline" onClick={onReviewClick} className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Add Query
              </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default FullScreenDocumentView;