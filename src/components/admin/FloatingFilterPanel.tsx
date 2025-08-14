import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import CountrySelector from '@/components/CountrySelector';
import DepartmentSelector from '@/components/DepartmentSelector';
import DocumentSearch from '@/components/DocumentSearch';
import DocumentLevelSelector from '@/components/DocumentLevelSelector';
interface FloatingFilterPanelProps {
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
export const FloatingFilterPanel: React.FC<FloatingFilterPanelProps> = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const handleClearFilters = () => {
    setSelectedCountry('all');
    setSelectedDepartment('all');
    setSearchTerm('');
    setDocumentLevel('all');
  };
  return <>
      {/* Floating Toggle Button - moved down to avoid logout button */}
      <div className="fixed top-20 right-4 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full shadow-lg bg-[t#fdb018ent] bg-[#fdb018]">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Floating Filter Panel */}
      <div className={cn("fixed top-32 right-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out", isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none", "w-80 max-w-[calc(100vw-2rem)]")}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <CountrySelector value={selectedCountry} onChange={setSelectedCountry} countries={countries} multiSelect={true} label="Country" className="w-full" />
            
            <DepartmentSelector value={selectedDepartment} onChange={setSelectedDepartment} multiSelect={true} label="Department" className="w-full" />
            
            <div>
              
              <DocumentLevelSelector value={documentLevel} onChange={setDocumentLevel} />
            </div>
            
            <div>
              
              <DocumentSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>

            {/* Clear Filters Button */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={handleClearFilters} variant="outline" className="w-full" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setIsOpen(false)} />}
    </>;
};