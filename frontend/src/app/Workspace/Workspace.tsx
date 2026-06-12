"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast for notifications
import IconBar from "@/components/Iconbar";
import Header from "@/components/Header";
import NavigationBar from "@/components/Navigationbar";
import WorkspaceSidebar from "@/components/Sidebar";
import DatabaseCard from "@/components/DatabaseCard";
import SourceConnectionModal from "@/components/SourceConnectionModal";
import DatabaseDialog from "@/components/DatabaseDialog";
import NewProjectDialog from "@/components/NewProjectDialog";
import ConnectionSuccessPopup from "@/components/ConnectionSuccessPopup";
import {
  useCreateConnection,
  useTestConnection,
  useGetConnection,
} from "@/hooks/useSourceConnection"; // Import our new hooks
import { useUser } from "@/context/UserContext"; // Import useUser hook

interface SavedConnection {
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
  source_name: string;
  isConnected: boolean;
}

export function Workspace() {
  const router = useRouter();
  const { workspaceId } = useUser(); // Get workspaceId from context
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [workspacePaneCollapsed, setWorkspacePaneCollapsed] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [connectedDatabase, setConnectedDatabase] = useState<string | null>(
    null
  );
  const [showSourceConnectionModal, setShowSourceConnectionModal] =
    useState(false);
  const [showDatabaseDialog, setShowDatabaseDialog] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showConnectionSuccess, setShowConnectionSuccess] = useState(false);
  const [savedConnections, setSavedConnections] = useState<
    Record<string, SavedConnection>
  >({});
  const [connectionForm, setConnectionForm] = useState({
    name: "",
    host: "",
    port: "",
    username: "",
    password: "",
    database: "",
    source_name: "",
  });
  const [workspaceData, setWorkspaceData] = useState<{
    name: string; 
    description: string;
    workspace?: { name: string; description: string };
    projects: Array<{ name: string; description: string }>;
  } | null>(null);

  // Initialize mutation hooks
  const createConnectionMutation = useCreateConnection();
  const testConnectionMutation = useTestConnection();

  // Initialize query hook for fetching connection details
  const { data: connectionData, isLoading, error } = useGetConnection();

  // Effect to update savedConnections when connection data is fetched from backend
  useEffect(() => {
    if (connectionData) {
      const { connection_name, source_name, connection_details } =
        connectionData;
      const dbType =
        source_name === "postgres"
          ? "PostgreSQL"
          : source_name.charAt(0).toUpperCase() + source_name.slice(1);

      setSavedConnections((prev) => ({
        ...prev,
        [dbType]: {
          name: connection_name,
          host: connection_details.host,
          port: connection_details.port.toString(),
          username: connection_details.username,
          password: connection_details.password,
          database: connection_details.database,
          source_name: dbType,
          isConnected: true,
        },
      }));

      setConnectedDatabase(dbType);

      console.log("Updated saved connections with backend data:", {
        dbType,
        connectionData,
      });
    }
  }, [connectionData]);

  useEffect(() => {
    const loadWorkspaceData = () => {
      const savedData = localStorage.getItem("workspaceData");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log("Loaded workspace data:", parsedData);
          
          // Handle different formats of workspace data
          let formattedData = {
            name: "",
            description: "",
            projects: []
          };
          
          if (parsedData.workspace) {
            // If data already has workspace property
            formattedData.name = parsedData.workspace.name;
            formattedData.description = parsedData.workspace.description;
          } else if (parsedData.name) {
            // If data has name at the top level (from CreateWorkspaceModal)
            formattedData.name = parsedData.name;
            formattedData.description = parsedData.description || "";
          }
          
          // Handle projects
          if (parsedData.projects) {
            formattedData.projects = parsedData.projects;
          } else if (parsedData.project) {
            formattedData.projects = [];
          }
          
          setWorkspaceData(formattedData);
          console.log("Formatted workspace data:", formattedData);
        } catch (error) {
          console.error("Error parsing workspace data:", error);
        }
      }
    };

    // Load initial data
    loadWorkspaceData();

    // Listen for storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "workspaceData") {
        loadWorkspaceData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Show loading state while fetching connection data
  useEffect(() => {
    if (isLoading) {
      toast.loading("Loading connection details...");
    } else {
      toast.dismiss();
      if (error) {
        toast.error("Failed to load connection details. Please try again.");
        console.error("Connection fetch error:", error);
      }
    }
  }, [isLoading, error]);

  const handleSelectDatabase = (dbName: string, fromSidebar = false) => {
    if (fromSidebar && savedConnections[dbName]) {
      setSidebarCollapsed(true);
      setConnectedDatabase(dbName);
      router.push("/active-db");
    } else {
      setSelectedDatabase(dbName);
      setShowSourceConnectionModal(true);
      if (!savedConnections[dbName]) {
        setConnectionForm({
          name: `${dbName} Connection`,
          host: "localhost",
          port: getDefaultPort(dbName),
          username: "",
          password: "",
          database: "",
          source_name: dbName, // Set the database type
        });
      }
    }
  };

  const getDefaultPort = (dbType: string) => {
    const ports: { [key: string]: string } = {
      PostgreSQL: "5432",
      MySQL: "3306",
      MongoDB: "27017",
      "SQL Server": "1433",
      Oracle: "1521",
      Redis: "6379",
    };
    return ports[dbType] || "";
  };

  const handleTestConnection = async () => {
    if (!selectedDatabase || !connectionForm.name.trim()) {
      toast.error("Please provide all required connection details");
      return;
    }

    try {
      // Show loading state
      toast.loading("Testing connection...");

      // Format payload to match test connection endpoint requirements
      const testPayload = {
        username: connectionForm.username,
        password: connectionForm.password,
        host: connectionForm.host,
        port: Number(connectionForm.port),
        database: connectionForm.database,
      };

      // Call the test connection API with simplified payload
      await testConnectionMutation.mutateAsync(testPayload);

      // Dismiss loading toast and show success
      toast.dismiss();
      setShowConnectionSuccess(true);
      toast.success("Connection test successful!");

      setTimeout(() => setShowConnectionSuccess(false), 3000);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss();
      toast.error(
        "Connection test failed. Please check your details and try again."
      );
      console.error("Connection test error:", error);
    }
  };

  const handleSaveConnection = async () => {
    if (!selectedDatabase || !connectionForm.name.trim()) {
      toast.error("Please provide all required connection details");
      return;
    }

    try {
      // Show loading state
      toast.loading("Saving connection...");

      // Only send the payload structure that backend expects
      const payload = {
        connection_name: connectionForm.name,
        source_name:
          selectedDatabase === "PostgreSQL"
            ? "postgres"
            : selectedDatabase?.toLowerCase(), // Map PostgreSQL to postgres
        connection_details: {
          username: connectionForm.username,
          password: connectionForm.password,
          host: connectionForm.host,
          port: Number(connectionForm.port),
          database: connectionForm.database,
        },
      };

      // Call the API to save the connection with proper payload structure
      await createConnectionMutation.mutateAsync(payload);

      // Update local state
      setSavedConnections({
        ...savedConnections,
        [selectedDatabase]: {
          ...connectionForm,
          source_name: selectedDatabase,
          isConnected: true,
        },
      });

      setConnectedDatabase(selectedDatabase);

      // Dismiss loading toast and show success
      toast.dismiss();
      setShowConnectionSuccess(true);
      toast.success("Connection saved successfully!");

      setTimeout(() => setShowConnectionSuccess(false), 3000);
      setShowSourceConnectionModal(false);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss();
      toast.error("Failed to save connection. Please try again.");
      console.error("Save connection error:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setConnectionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditConnection = (dbName: string) => {
    setSelectedDatabase(dbName);
    setShowSourceConnectionModal(true);
    if (savedConnections[dbName]) {
      const connection = savedConnections[dbName];
      setConnectionForm({
        name: connection.name,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        database: connection.database,
        source_name: connection.source_name,
      });
    }
  };

  const handleDeleteConnection = (dbName: string) => {
    const updatedConnections = { ...savedConnections };
    delete updatedConnections[dbName];
    setSavedConnections(updatedConnections);
    if (connectedDatabase === dbName) {
      setConnectedDatabase(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Icon Bar */}
      <IconBar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Workspace Sidebar */}
      <WorkspaceSidebar
        workspacePaneCollapsed={workspacePaneCollapsed}
        toggleWorkspacePane={() => setWorkspacePaneCollapsed(!workspacePaneCollapsed)}
        savedConnections={savedConnections}
        handleSelectDatabase={handleSelectDatabase}
        setShowNewProjectDialog={setShowNewProjectDialog}
        // handleEditConnection={handleEditConnection}
        handleDeleteConnection={handleDeleteConnection}
        workspaceName={workspaceData?.name || "Loading..."}
        projects={workspaceData?.projects || []}
        selectedDatabase={connectedDatabase}
        projectName={workspaceData?.projects?.[0]?.name} recentActivities={[]}      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Navigation Bar */}
        <NavigationBar
          workspaceName={workspaceData?.name || "Loading..."}
          projectName={workspaceData?.projects?.[0]?.name || "Loading..."}
          databaseName={selectedDatabase || undefined}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {selectedDatabase
                ? `Create a New ${selectedDatabase} Connection`
                : "Create a New Connection"}
            </h2>
            <p className="text-gray-600">
              {selectedDatabase
                ? `Configure your ${selectedDatabase} connection details below`
                : "Select a database type to begin configuring your connection"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {databaseOptions.map((db) => (
              <DatabaseCard
                key={db.name}
                name={db.name}
                icon={db.icon}
                description={db.description}
                isSelected={selectedDatabase === db.name}
                onClick={() => handleSelectDatabase(db.name)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SourceConnectionModal */}
      {showSourceConnectionModal && (
        <SourceConnectionModal
          selectedDatabase={selectedDatabase}
          savedConnection={
            selectedDatabase ? savedConnections[selectedDatabase] : null
          }
          connectionForm={connectionForm}
          onInputChange={handleInputChange}
          onTest={handleTestConnection}
          onSave={handleSaveConnection}
          onClose={() => setShowSourceConnectionModal(false)}
        />
      )}

      {/* Dialogs */}
      {showDatabaseDialog && (
        <DatabaseDialog
          selectedDatabase={selectedDatabase}
          onSelect={handleSelectDatabase}
          onClose={() => setShowDatabaseDialog(false)}
        />
      )}

      {showNewProjectDialog && (
        <NewProjectDialog
          onClose={() => setShowNewProjectDialog(false)}
          onSubmit={(name) => {
            setWorkspaceData((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                projects: [...prev.projects, { name, description: "" }],
              };
            });
            setShowNewProjectDialog(false);
          }}
        />
      )}

      {/* Success Popup */}
      {showConnectionSuccess && <ConnectionSuccessPopup />}
    </div>
  );
}

const databaseOptions = [
  {
    name: "PostgreSQL",
    icon: "🐘",
    description: "Powerful, open source object-relational database",
  },
  {
    name: "MySQL",
    icon: "🐬",
    description: "Popular open source relational database",
  },
  {
    name: "SQL Server",
    icon: "🪟",
    description: "Microsoft's enterprise relational database",
  },
  { name: "MongoDB", icon: "🍃", description: "NoSQL document database" },
  { name: "Oracle", icon: "☁️", description: "Enterprise database solution" },
  {
    name: "SQLite",
    icon: "🔹",
    description: "Lightweight disk-based database",
  },
  {
    name: "MariaDB",
    icon: "🐋",
    description: "Community-developed fork of MySQL",
  },
  { name: "Redis", icon: "⚡", description: "In-memory data structure store" },
];