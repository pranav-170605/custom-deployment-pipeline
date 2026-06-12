'use client';

import React, { useState, useEffect } from 'react';
import { Database, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import IconSidebar from '../../components/Iconbar';
import WorkspaceSidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import DatabaseTab from '../Injestion/DatabaseTab/page';
import IngestionTab from '../Injestion/InjestionTab/page';
import ConnectionTab from '../Injestion/ConnectionTab/page';

interface IngestionService {
  name: string;
}

interface StoredWorkspaceData {
  workspace: {
    name: string;
    description: string;
  };
  project: {
    name: string;
    description: string;
  };
  connectedDatabase?: string;
}

const DatabaseServices = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('Ingestion');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [workspacePaneCollapsed, setWorkspacePaneCollapsed] = useState(false);
  const [expandedWorkspace, setExpandedWorkspace] = useState(true);
  const [ingestionServices, setIngestionServices] = useState<IngestionService[]>([]);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showDatabaseView, setShowDatabaseView] = useState(false);
  const [showPostgreSQLView, setShowPostgreSQLView] = useState(false);
  const [currentStep, setCurrentStep] = useState<'configure' | 'schedule'>('configure');
  const [configureCompleted, setConfigureCompleted] = useState(false);
  const [connectedDatabase, setConnectedDatabase] = useState<string | null>(null);
  const [savedConnections, setSavedConnections] = useState<Record<string, any>>({});
  const [workspaceData, setWorkspaceData] = useState({
    name: '',
    description: '',
    project: {
      name: '',
      description: ''
    }
  });

  const tabs = ['Database', 'Ingestion', 'Connection'];

  // Determine if we're on the active-db page
  const isActivePage = pathname?.includes('/active-db');

  // Set sidebar state based on page
  useEffect(() => {
    if (isActivePage) {
      setWorkspacePaneCollapsed(true);
    } else {
      setWorkspacePaneCollapsed(false);
    }
  }, [isActivePage]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleWorkspacePane = () => {
    setWorkspacePaneCollapsed(!workspacePaneCollapsed);
  };

  const handleIngestionServiceAdded = (newService: IngestionService) => {
    setIngestionServices([...ingestionServices, newService]);
  };

  const handleMetadataNext = () => {
    setConfigureCompleted(true);
    setShowScheduleForm(true);
    setShowMetadataForm(false);
    setCurrentStep('schedule');
  };

  const handleScheduleBack = () => {
    setShowScheduleForm(false);
    setShowMetadataForm(true);
    setCurrentStep('configure');
  };

  const handleDeploy = () => {
    setShowScheduleForm(false);
    setShowDatabaseView(true);
    setShowPostgreSQLView(false);
    
    // Add a new service to the list
    const newIngestion: IngestionService = {
      name: `Postgres_metadata_${Math.random().toString(36).substr(2, 8)}`
    };
    handleIngestionServiceAdded(newIngestion);
  };

  const handleNext = () => {
    setShowPostgreSQLView(true);
  };

  // Update the tab switching logic to maintain database view state
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'Ingestion') {
      setShowMetadataForm(false);
      setShowScheduleForm(false);
      setShowDatabaseView(false);
      setShowPostgreSQLView(false);
    }
  };

  useEffect(() => {
    // Get the workspace data from localStorage
    const storedData = localStorage.getItem('workspaceData');
    const storedConnections = localStorage.getItem('savedConnections');
    
    if (storedData) {
      try {
        const parsedData: StoredWorkspaceData = JSON.parse(storedData);
        console.log('Loaded workspace data:', parsedData); // Debug log
        
        // Check if parsedData has the expected structure
        if (parsedData.workspace && parsedData.project) {
          setWorkspaceData({
            name: parsedData.workspace.name || '',
            description: parsedData.workspace.description || '',
            project: {
              name: parsedData.project.name || '',
              description: parsedData.project.description || ''
            }
          });
        } else {
          console.error('Workspace data has unexpected structure:', parsedData);
        }
        
        // Set connected database from stored data if available
        if (parsedData.connectedDatabase) {
          setConnectedDatabase(parsedData.connectedDatabase);
          
          // Only redirect if we're not already on the active-db page
          if (!isActivePage) {
            router.push(`/active-db?db=${encodeURIComponent(parsedData.connectedDatabase)}`);
          }
        }
      } catch (error) {
        console.error('Error parsing workspace data:', error);
      }
    } else {
      console.log('No workspace data found in localStorage');
    }

    if (storedConnections) {
      try {
        const connections = JSON.parse(storedConnections);
        console.log('Loaded connections:', connections); // Debug log
        setSavedConnections(connections);
      } catch (error) {
        console.error('Error parsing connections:', error);
      }
    }

    // Get the database from URL params
    const dbFromUrl = searchParams.get('db');
    console.log('Database from URL:', dbFromUrl); // Debug log
    
    if (dbFromUrl) {
      setConnectedDatabase(dbFromUrl);
      
      // Update localStorage with the selected database
      if (storedData) {
        try {
          const parsedData: StoredWorkspaceData = JSON.parse(storedData);
          const updatedData = {
            ...parsedData,
            connectedDatabase: dbFromUrl
          };
          localStorage.setItem('workspaceData', JSON.stringify(updatedData));
        } catch (error) {
          console.error('Error updating workspace data:', error);
        }
      }
    }
  }, [searchParams, router, isActivePage]);

  // Add debug logging for workspace data
  useEffect(() => {
    console.log('Current workspace data:', workspaceData);
  }, [workspaceData]);

  // Add debug logging for connected database
  useEffect(() => {
    console.log('Current connected database:', connectedDatabase);
  }, [connectedDatabase]);

  // Add a function to handle database selection
  const handleSelectDatabase = (dbName: string, fromSidebar?: boolean) => {
    setConnectedDatabase(dbName);
    
    // Update URL with the selected database
    router.push(`/active-db?db=${encodeURIComponent(dbName)}`);
  };

  // Render function for the active tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'Database':
        return <DatabaseTab connectedDatabase={connectedDatabase} />;
      case 'Ingestion':
        return (
          <IngestionTab
            showPostgreSQLView={showPostgreSQLView}
            showDatabaseView={showDatabaseView}
            showScheduleForm={showScheduleForm}
            showMetadataForm={showMetadataForm}
            handleNext={handleNext}
            handleScheduleBack={handleScheduleBack}
            handleDeploy={handleDeploy}
            handleMetadataNext={handleMetadataNext}
            setShowMetadataForm={setShowMetadataForm}
            currentStep={currentStep}
            configureCompleted={configureCompleted}
          />
        );
      case 'Connection':
        return <ConnectionTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Icon Sidebar */}
      <IconSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />

      {/* Workspace Sidebar */}
      <WorkspaceSidebar 
        workspacePaneCollapsed={workspacePaneCollapsed}
        toggleWorkspacePane={toggleWorkspacePane}
        savedConnections={savedConnections}
        handleSelectDatabase={handleSelectDatabase}
        recentActivities={[]}
        setShowNewProjectDialog={() => {}}
        workspaceName={workspaceData.name}
        projects={[{
          name: workspaceData.project.name,
          description: workspaceData.project.description,
          databases: Object.keys(savedConnections).map(key => ({
            name: key,
            type: savedConnections[key].type || 'Unknown',
            status: 'active'
          }))
        }]}
        selectedDatabase={connectedDatabase}
        projectName={workspaceData.project.name}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Now using the dedicated component */}
        <Header title="Database Services" />

        {/*  Services Content */}
        <div className="flex-1 overflow-auto bg-white">
          {/* Service Header */}
          <div className="p-6 border-b bg-white">
            <div className="flex items-center mb-4">
              <button 
                className="mr-4"
                onClick={() => router.push('/workspace')}
              >
                <ChevronLeft size={20} className="text-gray-500" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {connectedDatabase ? `${connectedDatabase} Database` : 'Database'}
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium -mb-px ${
                    activeTab === tab
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6 bg-white">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseServices;