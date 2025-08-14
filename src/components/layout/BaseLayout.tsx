
import React from 'react';
import { cn } from '@/lib/utils';

interface BaseLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  title,
  subtitle,
  sidebar,
  header,
  actions,
  className
}) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      {header && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {header}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {sidebar}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className={cn("p-6 space-y-6", className)}>
            {/* Page Header */}
            {(title || subtitle || actions) && (
              <div className="flex items-center justify-between">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-3">
                    {actions}
                  </div>
                )}
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
