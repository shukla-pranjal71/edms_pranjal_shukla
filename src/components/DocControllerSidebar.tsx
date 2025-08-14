import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Archive, ChevronLeft, ChevronRight, ClipboardList, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from './table/DocumentTableTypes';
interface DocControllerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onArchivedClick: () => void;
  userRole?: UserRole;
}
const DocControllerSidebar = ({
  activeTab,
  onTabChange,
  onArchivedClick,
  userRole = 'document-controller'
}: DocControllerSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const baseTabs = [{
    id: 'documents',
    label: 'Documents',
    icon: <FileText className="mr-2 h-4 w-4" />
  }, {
    id: 'pending',
    label: 'Requests',
    icon: <ClipboardList className="mr-2 h-4 w-4" />
  }];

  // Add upload tab only for document controllers
  const tabsWithUpload = userRole === 'document-controller' ? [...baseTabs, {
    id: 'upload',
    label: 'Upload Documents',
    icon: <Upload className="mr-2 h-4 w-4" />
  }] : baseTabs;

  // Only show archived tab for document controllers
  const tabs = userRole === 'document-controller' ? [...tabsWithUpload, {
    id: 'archived',
    label: 'Archived Documents',
    icon: <Archive className="mr-2 h-4 w-4" />
  }] : tabsWithUpload;
  const handleTabClick = (tabId: string) => {
    if (tabId === 'archived') {
      onArchivedClick();
    } else {
      onTabChange(tabId);
    }
  };
  const getSidebarTitle = () => {
    switch (userRole) {
      case 'document-controller':
        return 'Document Controller';
      case 'document-creator':
        return 'Document Creator';
      case 'document-owner':
        return 'Document Owner';
      case 'reviewer':
        return 'Document Reviewer';
      default:
        return 'Document Controller';
    }
  };
  return <div className={cn("bg-gray-100 dark:bg-gray-800 p-4 h-full overflow-y-auto shadow-md transition-all duration-300", isCollapsed ? "w-16" : "w-56")}>
      <div className="flex items-center justify-between mb-6">
        {!isCollapsed && <h2 className="text-xl font-bold px-2 text-[#117bbc]">{getSidebarTitle()}</h2>}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="shrink-0 bg-[#117bbc] text-slate-50">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="space-y-1">
        {tabs.map(tab => <Button key={tab.id} variant={activeTab === tab.id ? "default" : "ghost"} className={cn("w-full font-normal transition-all duration-200", isCollapsed ? "justify-center px-2" : "justify-start text-left", activeTab === tab.id ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-gray-700")} onClick={() => handleTabClick(tab.id)} title={isCollapsed ? tab.label : undefined}>
            <span className={cn("flex items-center", isCollapsed && "mr-0")}>
              {React.cloneElement(tab.icon, {
            className: cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")
          })}
              {!isCollapsed && <span>{tab.label}</span>}
            </span>
          </Button>)}
      </div>
    </div>;
};
export default DocControllerSidebar;