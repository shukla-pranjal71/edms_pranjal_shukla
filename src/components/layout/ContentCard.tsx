
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface ContentCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  children,
  actions,
  className,
  headerClassName,
  contentClassName
}) => {
  return (
    <Card className={cn("shadow-sm bg-white dark:bg-card", className)}>
      {(title || description || actions) && (
        <CardHeader className={cn("pb-4", headerClassName)}>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{title}</CardTitle>}
              {description && <CardDescription className="text-gray-600 dark:text-gray-400">{description}</CardDescription>}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};
