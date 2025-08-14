
import React from 'react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      {children}
    </div>
  );
};
