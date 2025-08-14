
import React from 'react';
import AdminTabContent from './AdminTabContent';
import { AdminLayout } from './AdminLayout';
import { AdminDialogs } from './AdminDialogs';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboardProvider';
import { BaseDocumentRequest } from '../table/DocumentTableTypes';

const AdminDashboardContent = () => {
  // Use the admin dashboard provider
  const {
    selectedDocument,
    showDetailsDialog,
    setShowDetailsDialog,
    showNotificationDialog,
    setShowNotificationDialog,
    showConfirmArchiveDialog,
    setShowConfirmArchiveDialog,
    showConfirmDeleteDialog,
    setShowConfirmDeleteDialog,
    selectedCountry,
    setSelectedCountry,
    selectedDepartment,
    setSelectedDepartment,
    searchTerm,
    setSearchTerm,
    documentLevel,
    setDocumentLevel,
    activeTab,
    setActiveTab
  } = useAdminDashboard();

  return (
    <>
      <AdminLayout 
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        documentLevel={documentLevel}
        setDocumentLevel={setDocumentLevel}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      >
        <AdminTabContent activeTab={activeTab} />
      </AdminLayout>
      <AdminDialogs
        selectedDocument={selectedDocument as BaseDocumentRequest}
        showDetailsDialog={showDetailsDialog}
        setShowDetailsDialog={setShowDetailsDialog}
        showNotificationDialog={showNotificationDialog}
        setShowNotificationDialog={setShowNotificationDialog}
        showConfirmArchiveDialog={showConfirmArchiveDialog}
        setShowConfirmArchiveDialog={setShowConfirmArchiveDialog}
        showConfirmDeleteDialog={showConfirmDeleteDialog}
        setShowConfirmDeleteDialog={setShowConfirmDeleteDialog}
        handleSendNotification={() => {}}
        confirmArchive={() => {}}
        confirmDelete={() => {}}
      />
    </>
  );
};

export default AdminDashboardContent;
