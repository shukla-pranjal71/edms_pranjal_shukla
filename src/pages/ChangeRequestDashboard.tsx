import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/AppHeader';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChangeRequestsTable from "@/components/ChangeRequestsTable";
import ChangeRequestDetailsDialog from "@/components/ChangeRequestDetailsDialog";
import ChangeRequestForm, { ChangeRequest, ChangeRequestStatus } from '@/components/ChangeRequestForm';
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';
import { getInitialSyntheticData } from '@/data/syntheticData';
import { convertToBaseDocumentRequests, ensureBaseDocumentRequestType } from '@/utils/documentUtils';

interface TabConfig {
  title: string;
  description: string;
}

const changeRequestsStatusConfig: Record<string, TabConfig> = {
  'all': { title: 'All Change Requests', description: 'View all change requests across all statuses.' },
  'pending': { title: 'Pending Requests', description: 'Change requests awaiting approval.' },
  'approved': { title: 'Approved Requests', description: 'Change requests that have been approved.' },
  'rejected': { title: 'Rejected Requests', description: 'Change requests that have been rejected.' },
  'completed': { title: 'Completed Requests', description: 'Change requests that have been completed.' }
};

const ChangeRequestDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isChangeRequestFormOpen, setIsChangeRequestFormOpen] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null);
  const [isChangeRequestDetailsOpen, setIsChangeRequestDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handlers
  const handleLogout = () => {
    navigate('/');
  };

  // Load data
  useEffect(() => {
    setIsLoading(true);
    try {
      const { documents, changeRequests } = getInitialSyntheticData();
      setDocuments(documents);
      
      // Ensure all change requests have correct status types
      const typedChangeRequests = changeRequests.map(request => {
        // Make sure status is one of the accepted values
        if (!['pending', 'approved', 'rejected', 'completed'].includes(request.status)) {
          return { ...request, status: 'pending' as ChangeRequestStatus };
        }
        return request;
      });
      
      setChangeRequests(typedChangeRequests);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filter change requests based on selected tab and search term
  const getFilteredChangeRequests = () => {
    return changeRequests.filter(request => {
      const matchesTab = selectedTab === 'all' || request.status === selectedTab;
      const matchesSearch = searchTerm === '' || 
        request.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesTab && matchesSearch;
    });
  };

  // Handle viewing a change request
  const handleViewChangeRequest = (request: ChangeRequest) => {
    setSelectedChangeRequest(request);
    setIsChangeRequestDetailsOpen(true);
  };

  // Handle adding a new change request with file attachment
  const handleAddChangeRequest = (request: Partial<ChangeRequest>, attachment?: File) => {
    // Add the new request
    const newRequest: ChangeRequest = {
      id: `cr-${Date.now()}`,
      documentId: request.documentId || '',
      documentName: request.documentName || '',
      status: 'pending',
      requestType: request.requestType || 'new-request',
      changeType: request.changeType,
      description: request.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestorId: 'current-user',
      requestorName: 'Current User',
      approverName: request.approverName || '',
      approverEmail: request.approverEmail || '',
      attachmentName: request.attachmentName || attachment?.name,
      comments: request.comments || []
    };
    
    setChangeRequests([...changeRequests, newRequest]);
    setIsChangeRequestFormOpen(false);
    toast({
      title: "Change request submitted",
      description: "Your change request has been submitted for approval and the file has been uploaded to the backend.",
    });
  };

  // Count requests by status for statistics
  const countRequestsByStatus = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0
    };
    
    changeRequests.forEach(request => {
      if (request.status in counts) {
        counts[request.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };
  
  const counts = countRequestsByStatus();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      
      <div className="container p-6 mx-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Change Request Dashboard</h1>
          <Button onClick={() => setIsChangeRequestFormOpen(true)}>New Change Request</Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white border hover:shadow-md cursor-pointer" onClick={() => setSelectedTab('pending')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-gray-900">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">{counts.pending}</p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">Awaiting approval</p>
            </CardFooter>
          </Card>
          
          <Card className="bg-white border hover:shadow-md cursor-pointer" onClick={() => setSelectedTab('approved')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-gray-900">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">{counts.approved}</p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">Ready for implementation</p>
            </CardFooter>
          </Card>
          
          <Card className="bg-white border hover:shadow-md cursor-pointer" onClick={() => setSelectedTab('rejected')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-gray-900">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">{counts.rejected}</p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">Needs revision</p>
            </CardFooter>
          </Card>
          
          <Card className="bg-white border hover:shadow-md cursor-pointer" onClick={() => setSelectedTab('completed')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-gray-900">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">{counts.completed}</p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">Successfully implemented</p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Tabs for different statuses */}
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab}>
            <Card>
              <CardHeader>
                <CardTitle>{changeRequestsStatusConfig[selectedTab as keyof typeof changeRequestsStatusConfig].title}</CardTitle>
                <CardDescription>{changeRequestsStatusConfig[selectedTab as keyof typeof changeRequestsStatusConfig].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search change requests..."
                    className="w-full p-2 border rounded"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <ChangeRequestsTable 
                  requests={getFilteredChangeRequests()}
                  onViewRequest={handleViewChangeRequest}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs */}
      {selectedChangeRequest && (
        <ChangeRequestDetailsDialog
          open={isChangeRequestDetailsOpen}
          onOpenChange={setIsChangeRequestDetailsOpen}
          request={selectedChangeRequest}
        />
      )}
      
      <ChangeRequestForm
        open={isChangeRequestFormOpen}
        onOpenChange={setIsChangeRequestFormOpen}
        onSubmit={handleAddChangeRequest}
        documents={convertToBaseDocumentRequests(documents)}
      />
    </div>
  );
};

export default ChangeRequestDashboard;
