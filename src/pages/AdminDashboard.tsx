
import React from 'react';
import { AdminDashboardProvider } from '../hooks/useAdminDashboard';
import AdminDashboardContent from '../components/admin/AdminDashboardContent';

const AdminDashboard = () => {
  return (
    <AdminDashboardProvider>
      <div className="min-h-screen bg-background">
        <AdminDashboardContent />
      </div>
    </AdminDashboardProvider>
  );
};

export default AdminDashboard;
