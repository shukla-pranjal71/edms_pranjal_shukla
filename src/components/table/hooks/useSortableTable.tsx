
import { useState } from 'react';
import { BaseDocumentRequest } from '../DocumentTableTypes';

type SortDirection = 'asc' | 'desc';

export const useSortableTable = (initialDocuments: BaseDocumentRequest[]) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Sort the documents based on the current sort settings
  const sortedDocuments = [...initialDocuments].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA: any, valueB: any;
    
    switch (sortColumn) {
      case 'code':
        valueA = a.documentCode;
        valueB = b.documentCode;
        break;
      case 'name':
        valueA = a.sopName;
        valueB = b.sopName;
        break;
      case 'owner':
        valueA = a.documentOwners[0]?.name || '';
        valueB = b.documentOwners[0]?.name || '';
        break;
      case 'country':
        valueA = a.country;
        valueB = b.country;
        break;
      case 'lastRevision':
        valueA = a.lastRevisionDate;
        valueB = b.lastRevisionDate;
        break;
      case 'nextRevision':
        valueA = a.nextRevisionDate;
        valueB = b.nextRevisionDate;
        break;
      case 'version':
        valueA = a.versionNumber;
        valueB = b.versionNumber;
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'uploadDate':
        valueA = a.createdAt || '';
        valueB = b.createdAt || '';
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
  
  return {
    sortedDocuments,
    sortColumn,
    sortDirection,
    handleSort
  };
};
