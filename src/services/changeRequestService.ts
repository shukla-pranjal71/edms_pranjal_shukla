
import { ChangeRequest, ChangeRequestStatus } from '@/components/ChangeRequestForm';
import { changeRequests } from '@/data/hardcodedData';
import { v4 as uuidv4 } from 'uuid';
import { safeCastRequestType, safeCastChangeStatus, safeJsonToString } from '@/utils/serviceTypeUtils';

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export const changeRequestService = {
  getAllChangeRequests: async (): Promise<ChangeRequest[]> => {
    await simulateDelay();
    console.log('Returning hardcoded change requests:', changeRequests);
    return [...changeRequests];
  },
  
  createChangeRequest: async (changeRequest: ChangeRequest, attachment?: File): Promise<ChangeRequest> => {
    await simulateDelay();
    
    if (!changeRequest.id) {
      changeRequest.id = uuidv4();
    }
    
    let fileUrl: string | undefined = undefined;
    
    // Simulate file upload
    if (attachment) {
      fileUrl = `https://example.com/files/${changeRequest.id}/${attachment.name}`;
      console.log('Simulated file upload for change request:', fileUrl);
    }
    
    const newChangeRequest = {
      ...changeRequest,
      createdAt: changeRequest.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachmentUrl: fileUrl || changeRequest.attachmentUrl || ''
    };
    
    changeRequests.push(newChangeRequest);
    console.log('Created new change request:', newChangeRequest);
    return newChangeRequest;
  },
  
  updateChangeRequest: async (changeRequest: ChangeRequest): Promise<void> => {
    await simulateDelay();
    
    const crIndex = changeRequests.findIndex(cr => cr.id === changeRequest.id);
    if (crIndex !== -1) {
      changeRequests[crIndex] = {
        ...changeRequest,
        updatedAt: new Date().toISOString()
      };
      console.log('Updated change request:', changeRequests[crIndex]);
    }
  },
  
  deleteChangeRequest: async (id: string): Promise<void> => {
    await simulateDelay();
    
    const crIndex = changeRequests.findIndex(cr => cr.id === id);
    if (crIndex !== -1) {
      const deletedCR = changeRequests.splice(crIndex, 1)[0];
      console.log('Deleted change request:', deletedCR);
    }
  }
};
