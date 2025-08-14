
import React from 'react';
import { OptimizedAdminLayout } from './OptimizedAdminLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  return <OptimizedAdminLayout {...props} />;
};
