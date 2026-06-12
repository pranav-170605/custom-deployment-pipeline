'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateWorkspace, useFetchWorkspaces } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import Modal from '../ui-components/Modal';
import { useUser } from '../context/UserContext';
import { useQueryClient } from '@tanstack/react-query';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (data: {
    name: string;
    description: string;
    project: { name: string; description: string };
  }) => void;
  isLoading: boolean;
  onSuccess?: () => void;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreateWorkspace,
  isLoading,
  onSuccess
}: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const { userId, setWorkspaceId } = useUser();
  const queryClient = useQueryClient();
  
  // Debug log to check if userId is available
  useEffect(() => {
    console.log("Current userId:", userId);
  }, [userId]);

  const handleSubmit = async () => {
    if (!userId) {
      toast.error('User ID not available. Please try logging in again.');
      return;
    }
    
  
    if (workspaceName.trim() && projectName.trim()) {
      const payload = {
        name: workspaceName,
        description: workspaceDescription,
        project: {
          name: projectName,
          description: projectDescription
        }
      };
  
      console.log("Submitting payload:", JSON.stringify(payload));
      console.log("User ID:", userId);
  
      setSubmitLoading(true);
  
      try {
        const response = await createWorkspace.mutateAsync(payload);
        toast.success('Workspace created successfully!');
        
        // Store the formatted workspace data in localStorage
        const workspaceData = {
          name: workspaceName,
          description: workspaceDescription,
          projects: [
            {
              name: projectName,
              description: projectDescription
            }
          ]
        };
        
        localStorage.setItem('workspaceData', JSON.stringify(workspaceData));
        
        // If the API response includes a workspace ID, store it in the context
        if (response && response.id) {
          setWorkspaceId(response.id);
        }
        
        onCreateWorkspace(payload);
        
        // Force refetch workspaces to update sidebar
        await queryClient.refetchQueries({ queryKey: ['workspaces', userId] });
        
        if (onSuccess) onSuccess();
        router.push('/Workspace');
        onClose();
      } catch (error: any) {
        console.error('Workspace creation error:', error);
  
        if (error.response) {
          const errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              'Failed to create workspace';
          toast.error(errorMessage);
        } else {
          toast.error('Failed to connect to server');
        }
      } finally {
        setSubmitLoading(false);
      }
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
    >
      <div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Workspace Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 text-black rounded-md p-2 focus:outline-teal-700"
            placeholder="Enter workspace name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Workspace Description
          </label>
          <textarea
            className="w-full border border-gray-300 text-black rounded-md p-2 focus:outline-teal-700"
            placeholder="Enter workspace description"
            value={workspaceDescription}
            onChange={(e) => setWorkspaceDescription(e.target.value)}
            rows={3}
          />
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
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Project Description
          </label>
          <textarea
            className="w-full border border-gray-300 text-black rounded-md p-2 focus:outline-teal-700"
            placeholder="Enter project description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <button
          className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800 disabled:bg-teal-500 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={submitLoading || isLoading || !workspaceName.trim() || !projectName.trim() || !userId}
        >
          {submitLoading || isLoading ? 'Creating...' : 'Create Workspace'}
        </button>
      </div>
    </Modal>
  );
}