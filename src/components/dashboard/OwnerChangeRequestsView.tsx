
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChangeRequest } from '../ChangeRequestForm';
import ChangeRequestsTable from '../ChangeRequestsTable';
import ChangeRequestDetailsDialog from '../ChangeRequestDetailsDialog';

interface OwnerChangeRequestsViewProps {
  changeRequests: ChangeRequest[];
  onApproveRequest: (request: ChangeRequest) => void;
  onRejectRequest: (request: ChangeRequest) => void;
  onQueryRequest: (request: ChangeRequest) => void;
}

export const OwnerChangeRequestsView: React.FC<OwnerChangeRequestsViewProps> = ({
  changeRequests,
  onApproveRequest,
  onRejectRequest,
  onQueryRequest
}) => {
  const { toast } = useToast();
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleViewRequest = (request: ChangeRequest) => {
    setSelectedChangeRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const handleApprove = (request: ChangeRequest) => {
    onApproveRequest(request);
    toast({
      title: "Request Approved",
      description: `Change request for ${request.documentName} has been approved.`,
      variant: "default"
    });
  };

  const handleReject = (request: ChangeRequest) => {
    onRejectRequest(request);
    toast({
      title: "Request Rejected",
      description: `Change request for ${request.documentName} has been rejected.`,
      variant: "destructive"
    });
  };

  const handleQuery = (request: ChangeRequest) => {
    onQueryRequest(request);
    toast({
      title: "Query Sent",
      description: `Query sent for change request on ${request.documentName}.`,
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Change Requests Table */}
      <Card className="bg-white dark:bg-card">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Change Requests</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Review and manage change requests for documents you own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangeRequestsTable 
            requests={changeRequests}
            onViewRequest={handleViewRequest}
            onApproveRequest={handleApprove}
            onRejectRequest={handleReject}
            onQueryRequest={handleQuery}
            userRole="document-owner"
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedChangeRequest && (
        <ChangeRequestDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          request={selectedChangeRequest}
        />
      )}
    </div>
  );
};

export default OwnerChangeRequestsView;
