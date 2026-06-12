import React, { useState } from 'react';

interface NewProjectDialogProps {
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  onClose,
  onSubmit
}) => {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = () => {
    if (projectName.trim()) {
      onSubmit(projectName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-[0.5px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Create New Project</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Project Name<span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className="w-full border border-gray-300 text-black rounded-md p-2 focus:outline-teal-700" 
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        
        <div className="flex justify-center space-x-3">
        
          <button 
            className="bg-teal-700 flex justify-center items-center text-white px-4 py-2 rounded text-sm"
            onClick={handleSubmit}
            disabled={!projectName.trim()}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectDialog; 