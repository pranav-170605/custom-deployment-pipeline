'use client';

import React from 'react';
import { Database } from 'lucide-react';

interface ConnectionDetailsProps {
  host: string;
  port: string;
  database: string;
  status: 'Connected' | 'Disconnected';
}

const ConnectionDetails: React.FC<ConnectionDetailsProps> = ({
  host = 'localhost',
  port = '5432',
  database = 'PostgreSQL',
  status = 'Connected'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-white p-8">
      <div className="w-full max-w-md">
        {/* Icon and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-medium text-gray-900">Connection Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your database connection settings here
          </p>
        </div>

        {/* Connection Details */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Host:</span>
            <span className="font-medium text-gray-900">{host}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Port:</span>
            <span className="font-medium text-gray-900">{port}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Database:</span>
            <span className="font-medium text-gray-900">{database}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2 py-1 text-sm rounded-full ${
              status === 'Connected' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDetails; 