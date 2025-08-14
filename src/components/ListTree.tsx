
import React from 'react';

interface ListTreeProps {
  items?: any[];
  renderItem?: (item: any) => React.ReactNode;
}

export const ListTree: React.FC<ListTreeProps> = ({ 
  items = [], 
  renderItem = (item) => <div>{JSON.stringify(item)}</div> 
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={index} className="pl-4 border-l-2 border-gray-200">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};
