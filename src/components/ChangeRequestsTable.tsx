import React, { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangeRequest } from './ChangeRequestForm';
import { UserRole } from './table/DocumentTableTypes';
import { Check, X, Eye, Download, Clock, HelpCircle } from 'lucide-react';

// Props interface
interface ChangeRequestsTableProps {
  requests: ChangeRequest[];
  onViewRequest: (request: ChangeRequest) => void;
  onCancelRequest?: (request: ChangeRequest) => void;
  onApproveRequest?: (request: ChangeRequest) => void;
  onRejectRequest?: (request: ChangeRequest) => void;
  onQueryRequest?: (request: ChangeRequest) => void;
  onPushToLive?: (request: ChangeRequest) => void;
  onDownloadRequest?: (request: ChangeRequest) => void;
  onViewLogs?: (request: ChangeRequest) => void;
  userRole?: UserRole;
}

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getStatusBadge = (status: string) => {
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

// Main component
const ChangeRequestsTable = ({
  requests,
  onViewRequest,
  onCancelRequest,
  onApproveRequest,
  onRejectRequest,
  onQueryRequest,
  onPushToLive,
  onDownloadRequest,
  onViewLogs,
  userRole = 'requester'
}: ChangeRequestsTableProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort the requests based on the current sort settings
  const sortedRequests = [...requests].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA: any, valueB: any;
    
    switch (sortColumn) {
      case 'id':
        valueA = a.id;
        valueB = b.id;
        break;
      case 'document':
        valueA = a.documentName;
        valueB = b.documentName;
        break;
      case 'type':
        valueA = a.requestType;
        valueB = b.requestType;
        break;
      case 'requester':
        valueA = a.requestorName;
        valueB = b.requestorName;
        break;
      case 'date':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Render action buttons for each row
  const renderActionButtons = (request: ChangeRequest) => {
    return (
      <div className="flex justify-end gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewRequest(request)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        
        {onDownloadRequest && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadRequest(request)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        )}
        
        {onViewLogs && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewLogs(request)}
          >
            <Clock className="h-4 w-4 mr-1" />
            Logs
          </Button>
        )}
        
        {userRole === 'requester' && request.status === 'pending' && onCancelRequest && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancelRequest(request)}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
        
        {userRole === 'document-owner' && request.status === 'pending' && (
          <>
            {onQueryRequest && (
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => onQueryRequest(request)}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Query
              </Button>
            )}
            
            {onRejectRequest && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onRejectRequest(request)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            )}
            
            {onApproveRequest && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onApproveRequest(request)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
          </>
        )}
        
        {userRole === 'document-controller' && request.status === 'approved' && onPushToLive && (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onPushToLive(request)}
          >
            Push to Live
          </Button>
        )}
      </div>
    );
  };

  // Calculate colspan based on user role
  const getColSpan = () => {
    return userRole === 'requester' ? 7 : (userRole === 'document-owner' ? 8 : 8);
  };

  return (
    <div className="rounded-md border overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              sortable
              sorted={sortColumn === 'id' ? sortDirection : null}
              onSort={() => handleSort('id')}
            >
              Request ID
            </TableHead>
            <TableHead 
              sortable
              sorted={sortColumn === 'document' ? sortDirection : null}
              onSort={() => handleSort('document')}
            >
              Document
            </TableHead>
            <TableHead 
              sortable
              sorted={sortColumn === 'type' ? sortDirection : null}
              onSort={() => handleSort('type')}
            >
              Type
            </TableHead>
            <TableHead 
              sortable
              sorted={sortColumn === 'requester' ? sortDirection : null}
              onSort={() => handleSort('requester')}
            >
              Requester
            </TableHead>
            {(userRole === 'document-owner' || userRole === 'document-controller') && (
              <TableHead>Approver</TableHead>
            )}
            <TableHead 
              sortable
              sorted={sortColumn === 'date' ? sortDirection : null}
              onSort={() => handleSort('date')}
            >
              Date
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRequests.length > 0 ? (
            sortedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.documentName}</TableCell>
                <TableCell>
                  {request.requestType === 'new-request' ? 'New Request' : 'Change Request'}
                  {request.requestType === 'change-request' && request.changeType && 
                    ` (${request.changeType === 'major' ? 'Major' : 'Minor'})`
                  }
                </TableCell>
                <TableCell>{request.requestorName}</TableCell>
                {(userRole === 'document-owner' || userRole === 'document-controller') && (
                  <TableCell>{request.approverName || '—'}</TableCell>
                )}
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  {renderActionButtons(request)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={getColSpan()} className="text-center py-8">
                No change requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChangeRequestsTable;
