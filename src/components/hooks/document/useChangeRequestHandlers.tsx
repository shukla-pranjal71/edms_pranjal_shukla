
import { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChangeRequest, ChangeRequestStatus } from '@/components/ChangeRequestForm';
import { useToast } from '@/hooks/use-toast';

interface ChangeRequestHandlersProps {
  changeRequests: ChangeRequest[];
  setChangeRequests: Dispatch<SetStateAction<ChangeRequest[]>>;
  selectedChangeRequest: ChangeRequest | null;
  setSelectedChangeRequest: Dispatch<SetStateAction<ChangeRequest | null>>;
  setIsChangeRequestDetailsOpen: Dispatch<SetStateAction<boolean>>;
  setIsChangeRequestFormOpen: Dispatch<SetStateAction<boolean>>;
}

export const useChangeRequestHandlers = ({
  changeRequests,
  setChangeRequests,
  selectedChangeRequest,
  setSelectedChangeRequest,
  setIsChangeRequestDetailsOpen,
  setIsChangeRequestFormOpen,
}: ChangeRequestHandlersProps) => {
  const { toast } = useToast();

  // View a change request's details
  const handleViewChangeRequest = (request: ChangeRequest) => {
    setSelectedChangeRequest(request);
    setIsChangeRequestDetailsOpen(true);
  };

  // Cancel a change request
  const handleCancelChangeRequest = async (request: ChangeRequest) => {
    try {
      // Update the status to 'rejected'
      const updatedRequests = changeRequests.map(req => {
        if (req.id === request.id) {
          return {
            ...req,
            status: 'rejected' as ChangeRequestStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return req;
      });
      
      setChangeRequests(updatedRequests);
      
      toast({
        title: "Request Cancelled",
        description: `Change request for ${request.documentName} has been cancelled.`
      });
    } catch (error) {
      console.error('Error cancelling change request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel change request",
        variant: "destructive"
      });
    }
  };

  // Add a new change request
  const handleAddChangeRequest = async (requestData: Partial<ChangeRequest>) => {
    try {
      // Create a new change request
      const newRequest: ChangeRequest = {
        id: uuidv4(),
        documentId: requestData.documentId || '',
        documentName: requestData.documentName || '',
        status: 'pending' as ChangeRequestStatus,
        requestType: requestData.requestType || 'new-request',
        changeType: requestData.changeType,
        description: requestData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requestorId: 'current-user',
        requestorName: 'Current User',
        attachmentName: requestData.attachmentName || '',
        attachmentUrl: requestData.attachmentUrl || '',
        approverName: requestData.approverName || '',
        approverEmail: requestData.approverEmail || '',
        comments: requestData.comments || [],
        documentCode: requestData.documentCode || '',
        documentType: requestData.documentType || '',
        department: requestData.department || '',
        versionNumber: requestData.versionNumber || '1.0',
        country: requestData.country || ''
      };
      
      setChangeRequests([...changeRequests, newRequest]);
      setIsChangeRequestFormOpen(false);
      
      toast({
        title: "Request Submitted",
        description: `Change request for ${newRequest.documentName} has been submitted.`
      });
      
      return newRequest;
    } catch (error) {
      console.error('Error adding change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit change request",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Generate a code for a new document based on department
  const generateCodeFromRequest = (department: string) => {
    const deptCode = department.substring(0, 3).toUpperCase();
    return `${deptCode}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  };

  // Generate version number based on request type
  const generateVersionNumberFromRequest = (documentCode: string, requestType: 'new-request' | 'change-request', changeType: 'major' | 'minor' | undefined, documents: any[] = []) => {
    // Find existing documents with the same code
    const existingDocs = documents.filter(doc => doc.documentCode === documentCode);
    
    if (existingDocs.length === 0) {
      return '1.0';
    }
    
    // Get the latest version
    const latestVersion = existingDocs
      .map(doc => doc.versionNumber || '1.0')
      .sort((a, b) => {
        const [aMajor, aMinor] = a.split('.').map(Number);
        const [bMajor, bMinor] = b.split('.').map(Number);
        
        if (aMajor !== bMajor) return bMajor - aMajor;
        return bMinor - aMinor;
      })[0];
    
    const [major, minor] = latestVersion.split('.').map(Number);
    
    if (requestType === 'new-request') {
      return '1.0';
    } else if (requestType === 'change-request' && changeType) {
      if (changeType === 'major') {
        return `${major + 1}.0`;
      } else {
        return `${major}.${minor + 1}`;
      }
    }
    
    return '1.0';
  };

  return {
    handleViewChangeRequest,
    handleCancelChangeRequest,
    handleAddChangeRequest,
    generateCodeFromRequest,
    generateVersionNumberFromRequest
  };
};
