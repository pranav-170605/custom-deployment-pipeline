"use client";
import { createContext, useContext, useState, useEffect } from "react";

// Define the UserContext type
interface UserContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  srcConnId: string | null;
  setSrcConnId: (id: string | null) => void;
  ingestionId: string | null;
  setIngestionId: (id: string | null) => void;
}


// Create UserContext
export const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider Component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      console.log('Initial userId from localStorage:', storedUserId);
      return storedUserId;
    }
    return null;
  });
      
  const [projectId, setProjectId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedProjectId = localStorage.getItem('projectId');
      console.log('Initial projectId from localStorage:', storedProjectId);
      return storedProjectId;
    }
    return null;
  });
  
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedWorkspaceId = localStorage.getItem('workspaceId');
      console.log('Initial workspaceId from localStorage:', storedWorkspaceId);
      return storedWorkspaceId;
    }
    return null;
  });

  const [srcConnId, setSrcConnId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedSrcConnId = localStorage.getItem('srcConnId');
      console.log('Initial srcConnId from localStorage:', storedSrcConnId);
      return storedSrcConnId;
    }
    return null;
  });
  
  const [ingestionId, setIngestionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedIngestionId = localStorage.getItem('ingestionId');
      console.log('Initial ingestionId from localStorage:', storedIngestionId);
      return storedIngestionId;
    }
    return null;
  });
  

  // Load IDs from localStorage on mount
  useEffect(() => {
    console.log('UserContext initialized with values:', {
      userId,
      projectId,
      workspaceId,
      srcConnId,
      ingestionId
    });
  }, [userId, projectId, workspaceId,srcConnId,ingestionId]);

  // Function to update userId and store in localStorage
  const updateUserId = (id: string | null) => {
    console.log('Setting userId:', id);
    setUserId(id);
    if (id) {
      localStorage.setItem("userId", id);
      console.log('✅ userId stored in localStorage:', id);
    } else {
      localStorage.removeItem("userId");
      console.log('❌ userId removed from localStorage');
    }
  };

  // Function to update projectId and store in localStorage
  const updateProjectId = (id: string | null) => {
    console.log('Setting projectId:', id);
    setProjectId(id);
    if (id) {
      localStorage.setItem("projectId", id);
      console.log('✅ projectId stored in localStorage:', id);
    } else {
      localStorage.removeItem("projectId");
      console.log('❌ projectId removed from localStorage');
    }
  };

  // Function to update workspaceId and store in localStorage
  const updateWorkspaceId = (id: string | null) => {
    console.log('Setting workspaceId:', id);
    setWorkspaceId(id);
    if (id) {
      localStorage.setItem("workspaceId", id);
      console.log('✅ workspaceId stored in localStorage:', id);
    } else {
      localStorage.removeItem("workspaceId");
      console.log('❌ workspaceId removed from localStorage');
    }
  };

  const updateSrcConnId = (id: string | null) => {
    console.log('Setting srcConnId:', id);
    setSrcConnId(id);
    if (id) {
      localStorage.setItem("srcConnId", id);
      console.log('✅ srcConnId stored in localStorage:', id);
    } else {
      localStorage.removeItem("srcConnId");
      console.log('❌ srcConnId removed from localStorage');
    }
  };
  
  const updateIngestionId = (id: string | null) => {
    console.log('Setting ingestionId:', id);
    setIngestionId(id);
    if (id) {
      localStorage.setItem("ingestionId", id);
      console.log('✅ ingestionId stored in localStorage:', id);
    } else {
      localStorage.removeItem("ingestionId");
      console.log('❌ ingestionId removed from localStorage');
    }
  };
  

  return (
    <UserContext.Provider value={{ 
      userId, 
      setUserId: updateUserId, 
      projectId, 
      setProjectId: updateProjectId, 
      workspaceId, 
      setWorkspaceId: updateWorkspaceId ,
      srcConnId,
      setSrcConnId: updateSrcConnId,
      ingestionId,
      setIngestionId: updateIngestionId
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  console.log('useUser hook accessed with current values:', {
    userId: context.userId,
    projectId: context.projectId,
    workspaceId: context.workspaceId
  });
  return context;
};