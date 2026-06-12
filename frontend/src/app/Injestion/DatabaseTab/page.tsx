import React from 'react';
import { Database } from 'lucide-react';
import DatabaseComponent from '../../../components/DatabaseCard';

interface DatabaseTabProps {
  connectedDatabase: string | null;
}

const DatabaseTab: React.FC<DatabaseTabProps> = ({ connectedDatabase }) => {
  return (
    <DatabaseComponent 
      name={connectedDatabase || 'No Database'}
      icon={<Database size={24} />}
      description="Select a database to view details"
      isSelected={false}
      onClick={() => {}}
    />
  );
};

export default DatabaseTab; 