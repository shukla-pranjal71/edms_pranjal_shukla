import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { DocumentRequest } from '../DocumentRequestForm';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';
import { format } from 'date-fns';
import TabbedRequestDialog from '../TabbedRequestDialog';
import { NewRequest } from '../NewRequestForm';
import { ChangeRequest } from '../ChangeRequestForm';
interface DocumentControllerPendingViewProps {
  documents: DocumentRequest[];
  onViewDetails?: (document: BaseDocumentRequest) => void;
  onTakeAction: (document: DocumentRequest) => void;
  onViewDocument: (document: DocumentRequest) => void;
}
const DocumentControllerPendingView: React.FC<DocumentControllerPendingViewProps> = ({
  documents,
  onViewDetails,
  onTakeAction,
  onViewDocument
}) => {
  const [isTabbedRequestDialogOpen, setIsTabbedRequestDialogOpen] = useState(false);
  const handleNewRequestSubmit = (request: Partial<NewRequest>) => {
    console.log('New Request submitted:', request);
    // Handle the new request submission logic here
  };
  const handleChangeRequestSubmit = (request: Partial<ChangeRequest>) => {
    console.log('Change Request submitted:', request);
    // Handle the change request submission logic here
  };

  // Filter documents to show those needing controller action - updated to remove pending-approval
  const pendingDocuments = documents.filter(doc => {
    // Include both under-review and queried status for controller action (removed pending-approval)
    return doc.status === 'under-review' || doc.status === 'queried';
  });
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under-review':
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Under Review</Badge>;
      case 'queried':
        return <Badge variant="destructive" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Queried</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const getPriorityIcon = (document: DocumentRequest) => {
    const today = new Date();
    const nextRevDate = document.nextRevisionDate ? new Date(document.nextRevisionDate) : null;
    const daysDiff = nextRevDate ? Math.ceil((nextRevDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
    if (daysDiff !== null && daysDiff <= 30) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Invalid Date';
    }
  };
  return <Card className="mt-6 bg-white dark:bg-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <CheckCircle className="h-5 w-5 text-orange-500" />
            Pending Controller Action ({pendingDocuments.length})
          </CardTitle>
          <Button onClick={() => setIsTabbedRequestDialogOpen(true)} variant="default" className="bg-[#117bbc] text-slate-50">
            <Plus className="h-4 w-4 mr-2" />
            Add New Request
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pendingDocuments.length === 0 ? <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No documents pending controller action
          </div> : <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700 dark:text-gray-300">Document Name</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Type</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Department</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Country</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Created</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Next Review</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDocuments.map(document => <TableRow key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(document)}
                      {document.sopName || 'Untitled Document'}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{document.documentType || 'N/A'}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{document.department || 'N/A'}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{document.country || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(document.status)}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{formatDate(document.createdAt)}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{formatDate(document.nextRevisionDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onViewDocument(document)} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="default" size="sm" onClick={() => onTakeAction(document)} className="bg-[#ffa530] hover:bg-[#e6942b]">
                        Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>}
      </CardContent>

      {/* Tabbed Request Dialog */}
      <TabbedRequestDialog open={isTabbedRequestDialogOpen} onOpenChange={setIsTabbedRequestDialogOpen} onSubmitNewRequest={handleNewRequestSubmit} onSubmitChangeRequest={handleChangeRequestSubmit} documents={documents.map(doc => ({
      ...doc,
      uploadDate: doc.uploadDate || '',
      isBreached: doc.isBreached || false
    }))} />
    </Card>;
};
export default DocumentControllerPendingView;