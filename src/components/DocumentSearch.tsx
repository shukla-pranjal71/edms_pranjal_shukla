
import React from 'react';
import { Search } from 'lucide-react';

interface DocumentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const DocumentSearch: React.FC<DocumentSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
      <span className="text-sm font-medium dark:text-gray-300 flex-shrink-0">Search:</span>
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <input 
          type="text" 
          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          placeholder="Search documents..." 
          value={searchTerm} 
          onChange={e => onSearchChange(e.target.value)} 
        />
      </div>
    </div>
  );
};

export default DocumentSearch;
