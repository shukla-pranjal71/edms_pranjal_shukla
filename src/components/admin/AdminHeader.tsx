
import React from 'react';
import CountrySelector from '@/components/CountrySelector';
import DepartmentSelector from '@/components/DepartmentSelector';
import DocumentSearch from '@/components/DocumentSearch';
import DocumentLevelSelector from '@/components/DocumentLevelSelector';

interface AdminHeaderProps {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  documentLevel: string;
  setDocumentLevel: (level: string) => void;
  countries?: string[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  selectedCountry,
  setSelectedCountry,
  selectedDepartment,
  setSelectedDepartment,
  searchTerm,
  setSearchTerm,
  documentLevel,
  setDocumentLevel,
  countries
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="relative z-50">
            <CountrySelector 
              value={selectedCountry} 
              onChange={setSelectedCountry} 
              countries={countries}
              multiSelect={false}
            />
          </div>
          <div className="relative z-40">
            <DepartmentSelector 
              value={selectedDepartment} 
              onChange={setSelectedDepartment}
              multiSelect={false}
            />
          </div>
          <div className="relative z-30">
            <DocumentLevelSelector value={documentLevel} onChange={setDocumentLevel} />
          </div>
        </div>
        <div className="w-full lg:flex-1 lg:max-w-md relative z-20">
          <DocumentSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
      </div>
    </div>
  );
};
