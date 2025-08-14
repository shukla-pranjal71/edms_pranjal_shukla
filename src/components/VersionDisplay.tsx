
import React from 'react';

interface VersionDisplayProps {
  className?: string;
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({ className = '' }) => {
  return (
    <div className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      Version 2.3.1
    </div>
  );
};

export default VersionDisplay;
