import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CountrySelector from "../CountrySelector";
import DepartmentSelector from "../DepartmentSelector";
import DocumentSearch from "../DocumentSearch";
import DocumentLevelSelector from "../DocumentLevelSelector";
import { UserRole } from "../table/DocumentTableTypes";

interface DashboardHeaderProps {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  documentLevel: string;
  setDocumentLevel: (level: string) => void;
  handleLogout: () => void;
  setIsFormOpen?: (open: boolean) => void;
  currentUserRole: UserRole;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedCountry,
  setSelectedCountry,
  selectedDepartment,
  setSelectedDepartment,
  searchTerm,
  setSearchTerm,
  documentLevel,
  setDocumentLevel,
  handleLogout,
  setIsFormOpen,
  currentUserRole,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Filters and Search */}
        <div className="flex items-center space-x-4">
          <CountrySelector
            value={selectedCountry}
            onChange={setSelectedCountry}
          />
          <DepartmentSelector
            value={selectedDepartment}
            onChange={setSelectedDepartment}
          />
          <DocumentLevelSelector
            value={documentLevel}
            onChange={setDocumentLevel}
          />
          <DocumentSearch value={searchTerm} onChange={setSearchTerm} />
        </div>

        {/* Right side - Add Document Button and Logout */}
        <div className="flex items-center space-x-4">
          {/* Add Document Button - only show for document-controller and requester roles */}
          {setIsFormOpen &&
            (currentUserRole === "document-controller" ||
              currentUserRole === "requester") && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-[#ffa530] hover:bg-[#e5942a] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            )}

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-gray-700 hover:text-gray-900"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
