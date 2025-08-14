
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import ModernAdminSidebar from './ModernAdminSidebar';
import { FloatingFilterPanel } from './FloatingFilterPanel';
import VersionDisplay from '@/components/VersionDisplay';

interface OptimizedAdminLayoutProps {
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

export const OptimizedAdminLayout: React.FC<OptimizedAdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full bg-gray-50 dark:bg-gray-900 relative">
        {/* Header spanning full width */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-20">
          <div className="flex items-center gap-3 px-6 py-4">
            <SidebarTrigger className="flex-shrink-0 h-10 w-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 rounded-md flex items-center justify-center">
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </SidebarTrigger>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">Admin Dashboard</h1>
          </div>
        </div>

        {/* Content area with sidebar and main content side by side */}
        <div className="flex flex-1 overflow-hidden">
          <ModernAdminSidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            {/* Main content with full utilization of available space */}
            <main className="flex-1 overflow-auto">
              <div className="p-6 w-full max-w-none">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>

        {/* Floating Filter Panel */}
        <FloatingFilterPanel
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          documentLevel={documentLevel}
          setDocumentLevel={setDocumentLevel}
          countries={countries}
        />

        {/* Version display in bottom-right corner */}
        <div className="fixed bottom-4 right-4 z-20">
          <VersionDisplay className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm" />
        </div>
      </div>
    </SidebarProvider>
  );
};
