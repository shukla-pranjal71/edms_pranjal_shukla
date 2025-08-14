
import React from 'react';
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, Minus } from "lucide-react";
import { cn } from '@/lib/utils';

interface DocumentTableHeaderProps {
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  areExtraColumnsVisible: boolean;
  onToggleExtraColumns: () => void;
}

const DocumentTableHeader: React.FC<DocumentTableHeaderProps> = ({
  sortColumn,
  sortDirection,
  onSort,
  areExtraColumnsVisible,
  onToggleExtraColumns
}) => {
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const SortableHeader = ({ column, children, className }: { column: string; children: React.ReactNode, className?: string }) => (
    <TableHead className={cn("p-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 font-semibold text-xs"
        onClick={() => onSort(column)}
      >
        {children}
        {getSortIcon(column)}
      </Button>
    </TableHead>
  );

  return (
    <>
      <SortableHeader column="documentCode">Document Code</SortableHeader>
      <SortableHeader column="sopName" className="w-[120px]">Document Name</SortableHeader>
      <SortableHeader column="documentOwners">Document Owner</SortableHeader>
      <SortableHeader column="reviewers">Reviewers</SortableHeader>
      <SortableHeader column="country">Country</SortableHeader>
      <SortableHeader column="lastRevisionDate">Last Revision</SortableHeader>
      <SortableHeader column="nextRevisionDate">Next Revision</SortableHeader>
      <SortableHeader column="versionNumber">Version</SortableHeader>
      <SortableHeader column="status">Status</SortableHeader>
      {areExtraColumnsVisible && (
        <>
          <SortableHeader column="pendingWith">Pending With</SortableHeader>
          <SortableHeader column="createdAt">Created</SortableHeader>
          <TableHead className="p-2 text-center">
            <span className="font-semibold text-xs">Download</span>
          </TableHead>
          <TableHead className="p-2 text-center">
            <span className="font-semibold text-xs">Actions</span>
          </TableHead>
        </>
      )}
      <TableHead className="p-2 text-center w-12">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={onToggleExtraColumns}
          aria-label={areExtraColumnsVisible ? "Hide extra columns" : "Show extra columns"}
        >
          {areExtraColumnsVisible ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </TableHead>
    </>
  );
};

export default DocumentTableHeader;
