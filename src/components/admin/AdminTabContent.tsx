import React from "react";
import { DocumentsOverviewTab } from "./DocumentsOverviewTab";
import { ArchivedDocumentsTab } from "./ArchivedDocumentsTab";
import { DeletedDocumentsTab } from "./DeletedDocumentsTab";
import DocumentUploadTab from "./DocumentUploadTab";
import UserManagementTab from "./UserManagementTab";
import RoleManagementTab from "./RoleManagementTab";
import CountryManagementTab from "./CountryManagementTab";
import DepartmentManagementTab from "./DepartmentManagementTab";
import DocumentTypeManagementTab from "./DocumentTypeManagementTab";
import DocumentNameManagementTab from "./DocumentNameManagementTab";
import DocumentLevelManagementTab from "./DocumentLevelManagementTab";
import EmailTemplatesTab from "./EmailTemplatesTab";
import ComplianceContactsTab from "./ComplianceContactsTab";
import WorkflowConfigurationTab from "./WorkflowConfigurationTab";
import { DatabaseStatus } from "../DatabaseStatus";
import { AdminContentContainer } from "../layout/AdminContentContainer";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboardProvider";

interface AdminTabContentProps {
  activeTab: string;
}

const AdminTabContent: React.FC<AdminTabContentProps> = ({ activeTab }) => {
  const {
    filteredDocuments,
    overallMetrics,
    selectedStatus,
    handleStatusFilterClick,
    handleViewDocument,
    handleDownload,
    handlePushNotification,
    handleArchiveDocument,
    handleDeleteDocument,
    handleRestoreDocument,
    handleExportDocuments,
    documents,
    archivedDocuments,
    deletedDocuments,
  } = useAdminDashboard();

  const getTabConfig = (tabId: string) => {
    const configs = {
      overview: { title: "Admin Overview", maxWidth: "full" as const },
      "document-upload": { title: "Document Upload", maxWidth: "6xl" as const },
      archived: { title: "Archived Documents", maxWidth: "7xl" as const },
      deleted: { title: "Deleted Documents", maxWidth: "7xl" as const },
      users: { title: "User Management", maxWidth: "6xl" as const },
      roles: { title: "Role Management", maxWidth: "5xl" as const },
      "workflow-config": {
        title: "Workflow Configuration",
        maxWidth: "6xl" as const,
      },
      "compliance-contacts": {
        title: "Compliance Contacts",
        maxWidth: "5xl" as const,
      },
      countries: { title: "Country Management", maxWidth: "4xl" as const },
      departments: { title: "Department Management", maxWidth: "4xl" as const },
      "document-types": {
        title: "Document Type Management",
        maxWidth: "4xl" as const,
      },
      "document-names": {
        title: "Document Name Management",
        maxWidth: "5xl" as const,
      },
      "document-levels": {
        title: "Document Level Control",
        maxWidth: "5xl" as const,
      },
      "email-templates": { title: "Email Templates", maxWidth: "6xl" as const },
      database: { title: "Database Status", maxWidth: "6xl" as const },
    };
    return (
      configs[tabId as keyof typeof configs] || {
        title: "Admin Dashboard",
        maxWidth: "7xl" as const,
      }
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DocumentsOverviewTab
            overallMetrics={overallMetrics}
            selectedStatus={selectedStatus}
            handleStatusFilterClick={handleStatusFilterClick}
            filteredDocuments={filteredDocuments}
            handleViewDocument={handleViewDocument}
            handleDownload={handleDownload}
            handlePushNotification={handlePushNotification}
            handleArchiveDocument={handleArchiveDocument}
            handleDeleteDocument={handleDeleteDocument}
            handleExportDocuments={handleExportDocuments}
          />
        );
      case "document-upload":
        return <DocumentUploadTab />;
      case "archived":
        return (
          <ArchivedDocumentsTab
            archivedDocuments={archivedDocuments}
            handleExportDocuments={handleExportDocuments}
            handleViewDocument={handleViewDocument}
            handleRestoreDocument={handleRestoreDocument}
          />
        );
      case "deleted":
        return (
          <DeletedDocumentsTab
            deletedDocuments={deletedDocuments}
            handleExportDocuments={handleExportDocuments}
            handleViewDocument={handleViewDocument}
            handleRestoreDocument={handleRestoreDocument}
          />
        );
      case "users":
        return <UserManagementTab />;
      case "roles":
        return <RoleManagementTab />;
      case "workflow-config":
        return <WorkflowConfigurationTab />;
      case "compliance-contacts":
        return <ComplianceContactsTab />;
      case "countries":
        return <CountryManagementTab />;
      case "departments":
        return <DepartmentManagementTab />;
      case "document-types":
        return <DocumentTypeManagementTab />;
      case "document-names":
        return <DocumentNameManagementTab />;
      case "document-levels":
        return <DocumentLevelManagementTab />;
      case "email-templates":
        return <EmailTemplatesTab />;
      case "database":
        return <DatabaseStatus />;
      default:
        return (
          <DocumentsOverviewTab
            overallMetrics={overallMetrics}
            selectedStatus={selectedStatus}
            handleStatusFilterClick={handleStatusFilterClick}
            filteredDocuments={filteredDocuments}
            handleViewDocument={handleViewDocument}
            handleDownload={handleDownload}
            handlePushNotification={handlePushNotification}
            handleArchiveDocument={handleArchiveDocument}
            handleDeleteDocument={handleDeleteDocument}
            handleExportDocuments={handleExportDocuments}
          />
        );
    }
  };

  const tabConfig = getTabConfig(activeTab);

  return (
    <AdminContentContainer maxWidth={tabConfig.maxWidth}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {tabConfig.title}
          </h1>
        </div>
        {renderTabContent()}
      </div>
    </AdminContentContainer>
  );
};

export default AdminTabContent;
