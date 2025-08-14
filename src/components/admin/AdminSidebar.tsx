import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Users,
  Archive,
  Trash2,
  Globe,
  Building2,
  FileText,
  Mail,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Workflow,
  UserCheck,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutGrid className="mr-2 h-4 w-4" />,
    },
    {
      id: "archived",
      label: "Archived Docs",
      icon: <Archive className="mr-2 h-4 w-4" />,
    },
    {
      id: "deleted",
      label: "Deleted Docs",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      id: "roles",
      label: "Role Management",
      icon: <UserCog className="mr-2 h-4 w-4" />,
    },
    {
      id: "workflow-config",
      label: "Workflow Config",
      icon: <Workflow className="mr-2 h-4 w-4" />,
    },
    {
      id: "compliance-contacts",
      label: "Compliance Contacts",
      icon: <UserCheck className="mr-2 h-4 w-4" />,
    },
    {
      id: "countries",
      label: "Countries",
      icon: <Globe className="mr-2 h-4 w-4" />,
    },
    {
      id: "departments",
      label: "Departments",
      icon: <Building2 className="mr-2 h-4 w-4" />,
    },
    {
      id: "document-types",
      label: "Document Types",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      id: "document-names",
      label: "Document Names",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      id: "email-templates",
      label: "Email Templates",
      icon: <Mail className="mr-2 h-4 w-4" />,
    },
    {
      id: "database",
      label: "Database Status",
      icon: <Database className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div
      className={cn(
        "bg-gray-100 dark:bg-gray-800 p-2 md:p-4 h-full overflow-y-auto shadow-md transition-all duration-300",
        isCollapsed ? "w-16" : "w-full md:w-56"
      )}
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        {!isCollapsed && (
          <h2 className="text-lg md:text-xl font-bold px-2 hidden md:block">
            Admin Dashboard
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={cn(
              "w-full font-normal transition-all duration-200 text-xs md:text-sm",
              isCollapsed
                ? "justify-center px-1 md:px-2"
                : "justify-start text-left",
              activeTab === tab.id
                ? "bg-gray-200 dark:bg-gray-700"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
            onClick={() => onTabChange(tab.id)}
            title={isCollapsed ? tab.label : undefined}
          >
            <span className={cn("flex items-center", isCollapsed && "mr-0")}>
              {React.cloneElement(tab.icon, {
                className: cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2"),
              })}
              {!isCollapsed && (
                <span className="hidden md:inline">{tab.label}</span>
              )}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
