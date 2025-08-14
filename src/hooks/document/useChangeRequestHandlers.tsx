
import { useState } from 'react';
import { ChangeRequest } from '@/components/ChangeRequestForm';
import { documentTypeService } from '@/services/documentTypeService';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';
import { useToast } from '@/hooks/use-toast';
import { changeRequestService } from '@/services/changeRequestService';

interface ChangeRequestHandlersProps {
  changeRequests: ChangeRequest[];
  setChangeRequests: React.Dispatch<React.SetStateAction<ChangeRequest[]>>;
  selectedChangeRequest: ChangeRequest | null;
  setSelectedChangeRequest: React.Dispatch<React.SetStateAction<ChangeRequest | null>>;
  setIsChangeRequestDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChangeRequestFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useChangeRequestHandlers = (props: ChangeRequestHandlersProps) => {
  const { toast } = useToast();
  
  const addChangeRequest = async (request: Partial<ChangeRequest>, attachment?: File) => {
    try {
      const newRequest: ChangeRequest = {
        id: `cr-${Date.now()}`,
        documentId: request.documentId || '',
        documentName: request.documentName || '',
        documentType: request.documentType || '',
        department: request.department || '',
        country: request.country || '',
        documentCode: request.documentCode || '',
        versionNumber: request.versionNumber || '',
        requestType: request.requestType || 'new-request',
        changeType: request.changeType,
        description: request.description || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requestorId: 'current-user',
        requestorName: 'Current User',
        approvers: request.approvers || [],
        // Legacy fields for backward compatibility
        approverName: request.approvers && request.approvers.length > 0 ? request.approvers[0].name : '',
        approverEmail: request.approvers && request.approvers.length > 0 ? request.approvers[0].email : '',
        attachmentName: request.attachmentName || attachment?.name,
        attachmentUrl: request.attachmentUrl,
        comments: []
      };
      
      // Save to backend with file upload
      const savedRequest = await changeRequestService.createChangeRequest(newRequest, attachment);
      
      const updatedChangeRequests = [...props.changeRequests, savedRequest];
      props.setChangeRequests(updatedChangeRequests);
      props.setIsChangeRequestFormOpen(false);
      
      toast({
        title: "Change Request Added",
        description: "The change request has been added successfully and saved to the backend.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding change request:', error);
      toast({
        title: "Error",
        description: "Failed to add change request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const viewChangeRequest = (request: ChangeRequest) => {
    props.setSelectedChangeRequest(request);
    props.setIsChangeRequestDetailsOpen(true);
  };

  const cancelChangeRequest = async (request: ChangeRequest) => {
    try {
      const updatedRequest = {
        ...request,
        status: 'rejected' as const,
        updatedAt: new Date().toISOString()
      };
      
      // Update in backend
      await changeRequestService.updateChangeRequest(updatedRequest);
      
      const updatedRequests = props.changeRequests.map(req => {
        if (req.id === request.id) {
          return updatedRequest;
        }
        return req;
      });
      
      props.setChangeRequests(updatedRequests);
      
      toast({
        title: "Request Cancelled",
        description: `Change request has been cancelled successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error cancelling change request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel change request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return {
    addChangeRequest,
    viewChangeRequest,
    cancelChangeRequest
  };
};
