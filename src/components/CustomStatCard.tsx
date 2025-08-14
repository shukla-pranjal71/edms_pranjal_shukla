
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, AlertTriangle, CheckCircle, Archive } from "lucide-react";

interface CustomStatCardProps {
  title: string;
  count: number;
  iconType: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}

const CustomStatCard: React.FC<CustomStatCardProps> = ({ 
  title, 
  count, 
  iconType, 
  color,
  onClick,
  isActive = false
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'file':
        return <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
      case 'clock':
        return <Clock className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
      case 'alert':
        return <AlertTriangle className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
      case 'check':
        return <CheckCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
      case 'archive':
        return <Archive className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <Card 
      className={`border bg-white dark:bg-card cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{count}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>
        <div className={`p-2 rounded-full ${isActive ? 'bg-primary/10 dark:bg-primary/10' : 'bg-gray-50 dark:bg-gray-700'}`}>
          {getIcon()}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomStatCard;
