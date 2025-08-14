
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { AdminDashboardProvider } from '@/hooks/admin/useAdminDashboardProvider';

const Index = () => {
  return (
    <AdminDashboardProvider>
      <div className="min-h-screen bg-background w-full pt-16">
        <Dashboard />
      </div>
    </AdminDashboardProvider>
  );
};

export default Index;
