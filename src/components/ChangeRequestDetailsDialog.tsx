import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChangeRequest } from './ChangeRequestForm';
import { Check, X, FileText, HelpCircle } from 'lucide-react';
import { UserRole } from './table/DocumentTableTypes';

// Props interface
interface ChangeRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ChangeRequest | null;
  onApprove?: (request: ChangeRequest) => void;
  onReject?: (request: ChangeRequest) => void;
  onPushToLive?: (request: ChangeRequest) => void;
  onQuery?: (request: ChangeRequest) => void;
  userRole?: UserRole;
}

// Helper component for status badges
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Component sections
const HeaderSection = ({ request }: { request: ChangeRequest }) => (
  <div className="flex justify-between items-center">
    <h3 className="font-semibold text-lg">{request.documentName}</h3>
    <div className="flex items-center gap-2">
      <StatusBadge status={request.status} />
    </div>
  </div>
);

const DetailsColumns = ({ request }: { request: ChangeRequest }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-gray-500">Request ID:</p>
        <p className="text-sm">{request.id}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500">Request Type:</p>
        <p className="text-sm">
          {request.requestType === 'new-request' ? 'New Request' : 'Change Request'}
          {request.requestType === 'change-request' && request.changeType && 
            ` (${request.changeType === 'major' ? 'Major' : 'Minor'})`
          }
        </p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500">Requested By:</p>
        <p className="text-sm">{request.requestorName}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500">Created:</p>
        <p className="text-sm">{formatDate(request.createdAt)}</p>
      </div>
    </div>
    
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-gray-500">Last Updated:</p>
        <p className="text-sm">{formatDate(request.updatedAt)}</p>
      </div>

      {request.approverName && (
        <div>
          <p className="text-sm font-medium text-gray-500">Approver:</p>
          <p className="text-sm">{request.approverName}</p>
        </div>
      )}

      {request.approverEmail && (
        <div>
          <p className="text-sm font-medium text-gray-500">Approver Email:</p>
          <p className="text-sm">{request.approverEmail}</p>
        </div>
      )}
      
      <div>
        <p className="text-sm font-medium text-gray-500">Document ID:</p>
        <p className="text-sm">{request.documentId || 'N/A'}</p>
      </div>
    </div>
  </div>
);

const DescriptionSection = ({ description }: { description: string }) => (
  <div className="space-y-2">
    <h4 className="font-medium">Description</h4>
    <p className="text-sm whitespace-pre-wrap p-3 bg-gray-50 rounded-md">{description}</p>
  </div>
);

const CommentsSection = ({ comments }: { comments?: string[] }) => {
  if (!comments || comments.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Comments</h4>
      <div className="space-y-1">
        {comments.map((comment, index) => (
          <div key={index} className="text-sm p-2 bg-gray-50 rounded-md">
            {comment}
          </div>
        ))}
      </div>
    </div>
  );
};

const AttachmentSection = ({ attachmentName }: { attachmentName?: string }) => {
  if (!attachmentName) return null;
  
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Attached Document</h4>
      <div className="flex items-center p-3 bg-gray-50 rounded-md">
        <FileText className="h-4 w-4 mr-2 text-gray-500" />
        <span className="text-sm">{attachmentName}</span>
        <Button variant="ghost" size="sm" className="ml-auto">Download</Button>
      </div>
    </div>
  );
};

const ActionButtons = ({ 
  request, 
  userRole,
  onApprove,
  onReject,
  onPushToLive,
  onQuery
}: { 
  request: ChangeRequest,
  userRole: UserRole,
  onApprove?: (request: ChangeRequest) => void,
  onReject?: (request: ChangeRequest) => void,
  onPushToLive?: (request: ChangeRequest) => void,
  onQuery?: (request: ChangeRequest) => void
}) => {
  if (userRole === 'document-owner' && request.status === 'pending') {
    return (
      <div className="flex justify-end gap-2 pt-2">
        {onQuery && (
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onQuery && onQuery(request)}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Query
          </Button>
        )}
        <Button 
          variant="outline" 
          className="border-red-300 text-red-600 hover:bg-red-50" 
          onClick={() => onReject && onReject(request)}
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white" 
          onClick={() => onApprove && onApprove(request)}
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
      </div>
    );
  }
  
  if (userRole === 'document-controller' && request.status === 'approved') {
    return (
      <div className="flex justify-end gap-2 pt-2">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white" 
          onClick={() => onPushToLive && onPushToLive(request)}
        >
          Push to Live
        </Button>
      </div>
    );
  }
  
  return null;
};

// Main component
const ChangeRequestDetailsDialog: React.FC<ChangeRequestDetailsDialogProps> = ({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject,
  onPushToLive,
  onQuery,
  userRole = 'requester'
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Change Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <HeaderSection request={request} />
          
          <Separator />
          
          <DetailsColumns request={request} />
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-sm whitespace-pre-wrap p-3 bg-gray-50 rounded-md">{request.description}</p>
          </div>
          
          {request.comments && request.comments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Comments</h4>
              <div className="space-y-1">
                {request.comments.map((comment, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded-md">
                    {comment}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {request.attachmentName && (
            <div className="space-y-2">
              <h4 className="font-medium">Attached Document</h4>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{request.attachmentName}</span>
                <Button variant="ghost" size="sm" className="ml-auto">Download</Button>
              </div>
            </div>
          )}
          
          <ActionButtons 
            request={request} 
            userRole={userRole} 
            onApprove={onApprove}
            onReject={onReject}
            onPushToLive={onPushToLive}
            onQuery={onQuery}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRequestDetailsDialog;
