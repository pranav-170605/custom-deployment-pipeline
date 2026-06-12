import React from 'react';
import ConnectionDetails from '../../../components/ConnectionDetails';

const ConnectionTab: React.FC = () => {
  return (
    <ConnectionDetails 
      host="localhost"
      port="5432"
      database="PostgreSQL"
      status="Connected"
    />
  );
};

export default ConnectionTab; 