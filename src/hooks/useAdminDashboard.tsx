
// This file now serves as a barrel export to maintain backward compatibility
import { AdminDashboardProvider, useAdminDashboard } from './admin/useAdminDashboardProvider';
import type { ChangeRequestStatus } from './admin/useAdminDashboardProvider';

export { AdminDashboardProvider, useAdminDashboard };
export type { ChangeRequestStatus };
