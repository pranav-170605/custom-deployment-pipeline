import React from 'react';
import { CheckCircle } from 'lucide-react';

const ConnectionSuccessPopup: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
      <CheckCircle size={20} className="mr-2" />
      <span>Connected successfully</span>
    </div>
  );
};

export default ConnectionSuccessPopup; 