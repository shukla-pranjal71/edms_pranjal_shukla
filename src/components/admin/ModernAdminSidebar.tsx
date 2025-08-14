import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Archive, Trash2, Globe, Building2, FileText, Mail, UserCog, Workflow, UserCheck, BarChart, ChevronLeft, ChevronRight, Upload, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
interface ModernAdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const ModernAdminSidebar: React.FC<ModernAdminSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  const {
    state,
    toggleSidebar
  } = useSidebar();
  const isCollapsed = state === "collapsed";

  // State for managing collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    documents: true,
    management: true,
    configuration: true
  });
  const navigationItems = [{
    id: 'overview',
    label: 'Overview',
    icon: BarChart
  }];
  const documentItems = [{
    id: 'document-upload',
    label: 'Document Upload',
    icon: Upload
  }, {
    id: 'archived',
    label: 'Archived Docs',
    icon: Archive
  }, {
    id: 'deleted',
    label: 'Deleted Docs',
    icon: Trash2
  }];
  const managementItems = [{
    id: 'roles',
    label: 'Role Management',
    icon: UserCog
  }, {
    id: 'workflow-config',
    label: 'Workflow Config',
    icon: Workflow
  }, {
    id: 'compliance-contacts',
    label: 'Compliance Contacts',
    icon: UserCheck
  }];
  const configurationItems = [{
    id: 'countries',
    label: 'Countries',
    icon: Globe
  }, {
    id: 'departments',
    label: 'Departments',
    icon: Building2
  }, {
    id: 'document-types',
    label: 'Document Types',
    icon: FileText
  }, {
    id: 'document-levels',
    label: 'Document Level Control',
    icon: FileText
  }];
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const renderMenuItems = (items: typeof navigationItems) => <SidebarMenu>
      {items.map(item => <SidebarMenuItem key={item.id}>
          <SidebarMenuButton isActive={activeTab === item.id} onClick={() => handleTabClick(item.id)} tooltip={isCollapsed ? item.label : undefined} className={cn("w-full justify-start transition-all duration-200 group", "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", activeTab === item.id ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" : "text-sidebar-foreground", isCollapsed ? "px-2" : "px-3")}>
            <item.icon className={cn("h-4 w-4 flex-shrink-0 transition-colors duration-200", activeTab === item.id ? "text-sidebar-primary-foreground" : "text-sidebar-primary")} />
            {!isCollapsed && <span className="truncate transition-all duration-200">{item.label}</span>}
          </SidebarMenuButton>
        </SidebarMenuItem>)}
    </SidebarMenu>;
  const renderCollapsibleSection = (sectionKey: keyof typeof expandedSections, title: string, items: typeof navigationItems) => <Collapsible open={expandedSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)} className="border-b border-sidebar-border/50 last:border-b-0">
      <SidebarGroup className="px-2 pb-1">
        <div className="flex items-center justify-between group/header">
          <SidebarGroupLabel className={cn("flex-1 font-semibold text-xs uppercase tracking-wider", "transition-all duration-200", "text-[hsl(210_100%_34%)] dark:text-[hsl(210_100%_44%)]", isCollapsed ? "sr-only" : "py-2 px-1")}>
            {title}
          </SidebarGroupLabel>
          {!isCollapsed && <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("h-6 w-6 p-0 rounded-md transition-all duration-200", "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", "group-hover/header:opacity-100 opacity-70")}>
                <ChevronDown className={cn("h-3 w-3 text-sidebar-primary transition-transform duration-200", expandedSections[sectionKey] ? "rotate-180" : "rotate-0")} />
              </Button>
            </CollapsibleTrigger>}
        </div>
        <CollapsibleContent className={cn("transition-all duration-200 ease-out", "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-1", "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-1")}>
          <SidebarGroupContent className="space-y-1">
            {renderMenuItems(items)}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>;
  return <Sidebar collapsible="icon" className={cn("border-r-2 bg-sidebar border-sidebar-border", "shadow-lg shadow-black/5 dark:shadow-black/20", "transition-all duration-300 ease-in-out", "relative z-10")} style={{
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '4rem'
  } as React.CSSProperties}>
      {/* Enhanced Header with close button */}
      <div className={cn("flex items-center justify-between px-4 py-2 border-b border-sidebar-border", "bg-gradient-to-r from-sidebar-background to-sidebar-background/98", "shadow-sm relative")}>
        {!isCollapsed && <div className="flex items-center space-x-2">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80", "shadow-sm")}>
              <LayoutGrid className="h-4 w-4 text-sidebar-primary-foreground bg-[#117bbc]" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#117bbc]">Admin</h2>
          </div>}
        
        {/* Close/Collapse Sidebar Button */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn("h-8 w-8 rounded-lg transition-all duration-300", "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", "focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2", "group relative", isCollapsed && "mx-auto")} aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}>
          <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "rotate-180" : "rotate-0")}>
            {isCollapsed ? <ChevronRight className="h-4 w-4 text-sidebar-primary" /> : <ChevronLeft className="h-4 w-4 text-sidebar-primary" />}
          </div>
        </Button>
      </div>

      <SidebarContent className={cn("pb-4 space-y-1 flex-1", "scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent", "overflow-y-auto")}>
        {renderCollapsibleSection('dashboard', 'Dashboard', navigationItems)}
        {renderCollapsibleSection('documents', 'Documents', documentItems)}
        {renderCollapsibleSection('management', 'Management', managementItems)}
        {renderCollapsibleSection('configuration', 'Configuration', configurationItems)}
      </SidebarContent>
    </Sidebar>;
};
export default ModernAdminSidebar;