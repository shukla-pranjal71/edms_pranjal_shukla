
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { documentTypeService } from "@/services/documentTypeService";
import { realtimeService } from "@/services/realtimeService";

interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  documentTypes?: string[];
  placeholder?: string;
  className?: string;
}

const DocumentTypeSelector = ({ 
  value, 
  onChange, 
  documentTypes: propDocTypes,
  placeholder = "Select Document Type",
  className = ""
}: DocumentTypeSelectorProps) => {
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);
  
  useEffect(() => {
    if (!propDocTypes) {
      fetchDocumentTypes();
    }

    const unsubscribe = realtimeService.subscribeToDocumentTypes(() => {
      console.log("Document types updated, refreshing data...");
      fetchDocumentTypes();
    });

    return () => {
      unsubscribe();
    };
  }, [propDocTypes]);

  useEffect(() => {
    if (propDocTypes && propDocTypes.length > 0) {
      const sortedTypes = [...propDocTypes].sort();
      setDocumentTypes(sortedTypes);
      updateFilteredTypes(sortedTypes);
    }
  }, [propDocTypes]);

  useEffect(() => {
    updateFilteredTypes(documentTypes);
  }, [searchTerm, documentTypes]);

  const updateFilteredTypes = (typesList: string[]) => {
    if (searchTerm === '') {
      setFilteredTypes(typesList);
    } else {
      const filtered = typesList.filter(type => 
        type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    }
  };

  const fetchDocumentTypes = async () => {
    setIsLoading(true);
    try {
      const typesData = await documentTypeService.getAllDocumentTypes();
      
      const typeNames = typesData.map(type => type.name);
      const sortedTypes = typeNames.sort();
      
      setDocumentTypes(sortedTypes);
      updateFilteredTypes(sortedTypes);
    } catch (error) {
      console.error('Error fetching document types:', error);
      const fallbackList = ['Form', 'Manual', 'SOP', 'Work Instruction'].sort();
      setDocumentTypes(fallbackList);
      setFilteredTypes(fallbackList);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium">Document Type</label>
      <Select value={value} onValueChange={(val) => onChange(val)} disabled={isLoading}>
        <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center border-b border-gray-300 dark:border-gray-600 px-3 py-2">
            <Search className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search document types..."
              className="h-8 bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ScrollArea className="h-48">
            {filteredTypes.map(type => (
              <SelectItem 
                key={type} 
                value={type}
                className="dark:text-white dark:hover:bg-gray-700"
              >
                {type}
              </SelectItem>
            ))}
            {filteredTypes.length === 0 && (
              <div className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
                No document types found
              </div>
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentTypeSelector;
