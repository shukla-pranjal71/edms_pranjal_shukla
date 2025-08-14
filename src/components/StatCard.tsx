
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  className,
  onClick,
  isActive = false
}) => {
  // Replace "Breached" title with "SLA Breached"
  const displayTitle = title === "Breached" ? "SLA Breached" : title;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200", 
        onClick && "hover:shadow-md cursor-pointer",
        isActive && "border-primary ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayTitle}</CardTitle>
        {icon && <div className={`text-gray-500 dark:text-gray-400 ${isActive ? 'text-primary dark:text-primary' : ''}`}>{icon}</div>}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
