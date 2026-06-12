'use client';

import React from 'react';

interface ConnectionFormProps {
  selectedDatabase: string;
  connectionName: string;
  onConnectionNameChange: (value: string) => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ 
  selectedDatabase, 
  connectionName,
  onConnectionNameChange
}) => {
  const getDefaultPort = () => {
    switch (selectedDatabase) {
      case 'MySQL':
        return '3306';
      case 'PostgreSQL':
        return '5432';
      case 'MongoDB':
        return '27017';
      case 'Redis':
        return '6379';
      case 'SQL Server':
        return '1433';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Connection Name</label>
        <input 
          type="text" 
          value={connectionName}
          onChange={(e) => onConnectionNameChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder={`${selectedDatabase} Connection`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Host</label>
        <input 
          type="text" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder="localhost" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Port</label>
        <input 
          type="text" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder={getDefaultPort()}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input 
          type="text" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder="root" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input 
          type="password" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Database Name</label>
        <input 
          type="text" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder="my_database" 
        />
      </div>
      <div className="pt-4">
        <button 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
};

export default ConnectionForm; 