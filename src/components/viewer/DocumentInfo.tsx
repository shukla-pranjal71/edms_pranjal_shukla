
import React from 'react';
import { DocumentRequest } from '../DocumentRequestForm';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { getStatusBadge } from "../../utils/statusBadgeUtils";

interface DocumentInfoProps {
  document: DocumentRequest;
}

const DocumentInfo: React.FC<DocumentInfoProps> = ({ document }) => {
  // Format relative time
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "";
    }
  };

  // Format date for display - show exact value or empty
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return "";
    }
  };

  // Use exact values from database - no defaults
  const documentCode = document.documentCode || '';
  const versionNumber = document.versionNumber || '';
  const department = document.department || '';
  const country = document.country || '';
  const documentType = document.documentType || '';
  const lastRevisionDate = document.lastRevisionDate || '';
  const nextRevisionDate = document.nextRevisionDate || '';
  const uploadDate = document.uploadDate || '';
  const documentNumber = document.documentNumber || '';
  
  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold dark:text-white mb-2">{document.sopName}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {document.createdAt && `Created ${getTimeAgo(document.createdAt)}`}
            </span>
            {documentType && (
              <>
                <span>•</span>
                <span>Document Type: {documentType}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(document.status)}
          {document.isBreached && (
            <Badge variant="destructive" className="text-white">
              SLA Breached
            </Badge>
          )}
          {document.needsReview && (
            <Badge className="bg-amber-500 text-white">
              Review Due
            </Badge>
          )}
        </div>
      </div>
      
      {/* Primary Document Information - only show if values exist */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {documentCode && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h3 className="text-xs uppercase text-blue-600 dark:text-blue-400 font-semibold mb-1">Document Code</h3>
            <p className="font-medium dark:text-white text-lg">{documentCode}</p>
          </div>
        )}
        {versionNumber && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <h3 className="text-xs uppercase text-green-600 dark:text-green-400 font-semibold mb-1">Version</h3>
            <p className="font-medium dark:text-white text-lg">{versionNumber}</p>
          </div>
        )}
        {department && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <h3 className="text-xs uppercase text-purple-600 dark:text-purple-400 font-semibold mb-1">Department</h3>
            <p className="font-medium dark:text-white">{department}</p>
          </div>
        )}
        {country && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <h3 className="text-xs uppercase text-orange-600 dark:text-orange-400 font-semibold mb-1">Country</h3>
            <p className="font-medium dark:text-white">{country}</p>
          </div>
        )}
      </div>
      
      {/* Revision Information - only show if dates exist */}
      {(lastRevisionDate || nextRevisionDate || uploadDate || documentNumber) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(lastRevisionDate || nextRevisionDate) && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Revision Dates</h3>
              <div className="space-y-2">
                {lastRevisionDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Revision:</span>
                    <span className="text-sm font-medium dark:text-white">{formatDate(lastRevisionDate)}</span>
                  </div>
                )}
                {nextRevisionDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Revision:</span>
                    <span className="text-sm font-medium dark:text-white">{formatDate(nextRevisionDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {(uploadDate || documentNumber) && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Document Details</h3>
              <div className="space-y-2">
                {uploadDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Upload Date:</span>
                    <span className="text-sm font-medium dark:text-white">{formatDate(uploadDate)}</span>
                  </div>
                )}
                {documentNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Document Number:</span>
                    <span className="text-sm font-medium dark:text-white">{documentNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* People Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Document Owners</h3>
          {document.documentOwners && document.documentOwners.length > 0 ? (
            <div className="space-y-2">
              {document.documentOwners.map((owner, index) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                  <span className="font-medium dark:text-white text-sm">{owner.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{owner.email}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No owners assigned</p>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Reviewers</h3>
          {document.reviewers && document.reviewers.length > 0 ? (
            <div className="space-y-2">
              {document.reviewers.map((reviewer, index) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                  <span className="font-medium dark:text-white text-sm">{reviewer.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{reviewer.email}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No reviewers assigned</p>
          )}
        </div>
      </div>

      {/* Additional Information */}
      {(document.documentCreators?.length || document.complianceNames?.length || document.description) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {document.documentCreators && document.documentCreators.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Document Creators</h3>
              <div className="space-y-2">
                {document.documentCreators.map((creator, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                    <span className="font-medium dark:text-white text-sm">{creator.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{creator.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {document.complianceNames && document.complianceNames.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Compliance Contacts</h3>
              <div className="space-y-2">
                {document.complianceNames.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                    <span className="font-medium dark:text-white text-sm">{contact.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {document.description && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{document.description}</p>
        </div>
      )}
    </>
  );
};

export default DocumentInfo;
