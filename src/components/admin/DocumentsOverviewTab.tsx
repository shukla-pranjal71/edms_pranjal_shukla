import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { File } from 'lucide-react';
import { DocumentTable } from "@/components/table";
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';

interface DocumentMetrics {
  total: number;
  live: number;
  underReview: number;
  approved: number;
  archived: number;
  deleted: number;
}

interface DocumentsOverviewTabProps {
  overallMetrics: DocumentMetrics;
  selectedStatus: string | null;
  handleStatusFilterClick: (status: string | null) => void;
  filteredDocuments: BaseDocumentRequest[];
  handleExportDocuments: () => void;
  handleViewDocument: (document: BaseDocumentRequest) => void;
  handleDownload: (document: BaseDocumentRequest) => void;
  handleDeleteDocument: (document: BaseDocumentRequest) => void;
  handleArchiveDocument: (document: BaseDocumentRequest) => void;
  handlePushNotification?: (document: BaseDocumentRequest) => void;
}

export const DocumentsOverviewTab: React.FC<DocumentsOverviewTabProps> = ({
  overallMetrics,
  selectedStatus,
  handleStatusFilterClick,
  filteredDocuments,
  handleExportDocuments,
  handleViewDocument,
  handleDownload,
  handleDeleteDocument,
  handleArchiveDocument,
  handlePushNotification
}) => {
  return (
    <>
      {/* Metrics Cards - Mobile Responsive - removed pending approval card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-10">
        <MetricCard 
          title="Live Documents" 
          value={overallMetrics.live} 
          iconPath="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          isSelected={selectedStatus === 'live'}
          onClick={() => handleStatusFilterClick('live')}
        />
        
        <MetricCard 
          title="For Review" 
          value={overallMetrics.underReview} 
          iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          isSelected={selectedStatus === 'under-review'}
          onClick={() => handleStatusFilterClick('under-review')}
        />
        
        <MetricCard 
          title="Approved" 
          value={overallMetrics.approved} 
          iconPath="M5 13l4 4L19 7"
          isSelected={selectedStatus === 'approved'}
          onClick={() => handleStatusFilterClick('approved')}
        />
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl md:text-2xl font-semibold dark:text-white">Document Management</h2>
          <Button onClick={handleExportDocuments} variant="outline" className="flex items-center gap-2 w-full md:w-auto">
            <File size={18} />
            Export
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <DocumentTable 
            documents={filteredDocuments} 
            onSelectDocument={handleViewDocument} 
            onDownload={handleDownload} 
            onDeleteDocument={handleDeleteDocument} 
            onArchiveDocument={handleArchiveDocument} 
            onViewDocument={handleViewDocument} 
            onPushNotification={handlePushNotification} 
          />
        </div>
      </div>
    </>
  );
};

// Metric Card Component - Mobile Responsive
interface MetricCardProps {
  title: string;
  value: number;
  iconPath: string;
  isSelected: boolean;
  onClick: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, iconPath, isSelected, onClick }) => {
  return (
    <Card 
      className={`p-4 shadow-sm bg-white border cursor-pointer hover:shadow-md transition-all ${isSelected ? 'ring-1 ring-primary' : ''}`} 
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-sm md:text-base text-gray-700">{title}</h3>
        <svg className="h-5 w-5 md:h-6 md:w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath}></path>
        </svg>
      </div>
      <div className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{value}</div>
    </Card>
  );
};
