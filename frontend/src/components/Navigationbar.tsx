import React from 'react';
import { ChevronRight } from 'lucide-react';

interface NavigationBarProps {
  workspaceName: string;
  projectName: string;
  databaseName?: string;
}

const NavigationBar = ({ 
  workspaceName, 
  projectName, 
  databaseName 
}: NavigationBarProps) => {
  return (
    <div className="flex items-center px-4 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center text-sm">
        <span className="text-teal-700 hover:text-teal-800 cursor-pointer">{workspaceName}</span>
        <ChevronRight size={16} className="mx-2 text-gray-400" />
        <span className="text-teal-700 hover:text-teal-800 cursor-pointer">{projectName}</span>
        {databaseName && (
          <>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-gray-600">{databaseName}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default NavigationBar; 