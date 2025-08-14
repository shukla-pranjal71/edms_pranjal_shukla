
import React from 'react';
import { cn } from '@/lib/utils';

interface AdminContentContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl';
}

export const AdminContentContainer: React.FC<AdminContentContainerProps> = ({
  children,
  title,
  description,
  actions,
  className,
  maxWidth = '7xl'
}) => {
  const maxWidthClass = {
    'full': 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
    '4xl': 'max-w-4xl'
  }[maxWidth];

  return (
    <div className={cn('w-full', maxWidthClass, 'mx-auto', className)}>
      {(title || description || actions) && (
        <div className="mb-8 pt-4">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
          )}
          {actions && (
            <div className="flex items-center gap-3 mb-3">
              {actions}
            </div>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
