
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentLevelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DocumentLevelSelector: React.FC<DocumentLevelSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
      <span className="text-sm font-medium dark:text-gray-300 flex-shrink-0">Document Level:</span>
      <div className="w-full md:w-40">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="live-cr">Live - CR</SelectItem>
            <SelectItem value="live-published">Live</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DocumentLevelSelector;
