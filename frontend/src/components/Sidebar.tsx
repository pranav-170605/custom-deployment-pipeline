"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  FileText,
  Database,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Package,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface WorkspaceSidebarProps {
  workspacePaneCollapsed: boolean;
  toggleWorkspacePane: () => void;
  savedConnections: Record<string, any>;
  handleSelectDatabase: (dbName: string, fromSidebar?: boolean) => void;
  recentActivities: any[];
  setShowNewProjectDialog: (show: boolean) => void;
  workspaceName: string;
  projects: Array<{
    name: string;
    description: string;
    databases?: Array<{
      name: string;
      type: string;
      status: string;
    }>;
  }>;
  handleEditConnection?: (dbName: string) => void;
  handleDeleteConnection?: (dbName: string) => void;
  selectedDatabase?: string | null;
  projectName?: string;
}

const WorkspaceSidebar = ({
  workspacePaneCollapsed,
  toggleWorkspacePane,
  savedConnections,
  handleSelectDatabase,
  recentActivities,
  setShowNewProjectDialog,
  workspaceName,
  projects,
  handleEditConnection = () => {},
  handleDeleteConnection = () => {},
  selectedDatabase = null,
  projectName = "",
}: WorkspaceSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedWorkspace, setExpandedWorkspace] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState(true);
  const [expandedConnections, setExpandedConnections] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState("");
  const [isActivePage, setIsActivePage] = useState(false);

  // Check if current page is active-db page
  useEffect(() => {
    if (pathname) {
      setIsActivePage(pathname.includes("/active-db"));
    }
  }, [pathname]);

  // Automatically collapse sidebar on active-db pages
  useEffect(() => {
    if (isActivePage && !workspacePaneCollapsed) {
      toggleWorkspacePane();
    } else if (!isActivePage && workspacePaneCollapsed) {
      toggleWorkspacePane();
    }
  }, [isActivePage, workspacePaneCollapsed]);

  // Handle window resize and set screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 768) setScreenSize("sm");
      else if (width < 1024) setScreenSize("md");
      else if (width < 1280) setScreenSize("lg");
      else setScreenSize("xl");
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to handle connection deletion with confirmation
  const confirmAndDeleteConnection = (dbName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up to parent elements
    const connectionName = savedConnections[dbName]?.name || dbName;

    if (
      confirm(
        `Are you sure you want to delete the connection to ${connectionName}?`
      )
    ) {
      handleDeleteConnection(dbName);
    }
  };

  // Function to handle connection editing
  const editConnection = (dbName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up to parent elements
    handleEditConnection(dbName);
  };

  const databaseOptions = [
    { name: "PostgreSQL", icon: "🐘" },
    { name: "MySQL", icon: "🐬" },
    { name: "SQL Server", icon: "🪟" },
    { name: "MongoDB", icon: "🍃" },
    { name: "Oracle", icon: "☁️" },
    { name: "SQLite", icon: "🔹" },
    { name: "MariaDB", icon: "🐋" },
    { name: "Redis", icon: "⚡" },
  ];

  // Responsive width and padding classes
  const getSidebarWidth = () => {
    if (workspacePaneCollapsed) return "w-12 md:w-14 lg:w-16";
    switch (screenSize) {
      case "sm":
        return "w-48";
      case "md":
        return "w-56";
      case "lg":
        return "w-60";
      case "xl":
        return "w-64";
      default:
        return "w-64";
    }
  };

  // Adaptive font and spacing
  const getFontSize = () => {
    switch (screenSize) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-sm";
      case "lg":
      case "xl":
        return "text-sm";
      default:
        return "text-sm";
    }
  };

  // Adaptive padding
  const getPadding = () => {
    switch (screenSize) {
      case "sm":
        return "p-2";
      case "md":
        return "p-3";
      case "lg":
      case "xl":
        return "p-4";
      default:
        return "p-4";
    }
  };

  const handleDatabaseClick = (dbName: string) => {
    handleSelectDatabase(dbName, true);
    router.push(`/active-db?db=${encodeURIComponent(dbName)}`);
  };

  // Render icons in collapsed mode
  const renderCollapsedIcons = () => {
    return (
      <div className="flex flex-col items-center space-y-6 py-6">
        <div className="cursor-pointer" title={workspaceName}>
          <Package
            size={24}
            className="text-zinc-500 hover:text-zinc-700"
          />
        </div>
        <div className="cursor-pointer" title="Projects">
          <Folder
            size={24}
            className="text-zinc-500 hover:text-zinc-700"
          />
        </div>
        <div className="cursor-pointer" title="Databases">
          <Database
            size={24}
            className="text-zinc-500 hover:text-zinc-700"
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white border-r border-gray-300 flex flex-col h-full transition-all duration-300 ${getSidebarWidth()}`}
    >
      <div
        className={`flex items-center justify-between ${getPadding()} relative`}
      >
        {!workspacePaneCollapsed && (
          <span className={`font-bold text-zinc-700 ${getFontSize()}`}>
            Workspace
          </span>
        )}
        <button
          className="text-zinc-500 hover:text-zinc-700 ml-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 rounded-md"
          onClick={toggleWorkspacePane}
          aria-label={
            workspacePaneCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {workspacePaneCollapsed ? (
            <ChevronRight size={screenSize === "sm" ? 16 : 20} />
          ) : (
            <ChevronLeft size={screenSize === "sm" ? 16 : 20} />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {workspacePaneCollapsed ? (
          renderCollapsedIcons()
        ) : (
          <div className={`px-2 md:px-3 lg:px-4 py-2`}>
            {/* WORKSPACES Section */}
            <div className="mb-4">
              {/* Workspaces Header */}
              <div
                className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-md group transition-colors`}
                onClick={() => setExpandedWorkspace(!expandedWorkspace)}
              >
                <div className="flex items-center">
                  <Package
                    size={screenSize === "sm" ? 14 : 16}
                    className="text-zinc-500 mr-2"
                  />
                  <h3 className={`${getFontSize()} font-medium text-zinc-700`}>
                    {workspaceName}
                  </h3>
                </div>
                {expandedWorkspace ? (
                  <ChevronDown
                    size={screenSize === "sm" ? 14 : 16}
                    className="text-zinc-500"
                  />
                ) : (
                  <ChevronRight
                    size={screenSize === "sm" ? 14 : 16}
                    className="text-zinc-500"
                  />
                )}
              </div>

              {/* Workspaces List */}
              {expandedWorkspace && (
                <div className="space-y-1 pl-6">
                  {/* Project Names */}
                  {projects.map((project, index) => (
                    <div key={index}>
                      <div className="flex items-center p-2 cursor-pointer hover:bg-gray-50 rounded-md group transition-colors">
                        <div className="flex items-center">
                          <FileText
                            size={screenSize === "sm" ? 14 : 16}
                            className="text-zinc-500 mr-2"
                          />
                          <span
                            className={`${getFontSize()} text-zinc-700 truncate max-w-xs`}
                          >
                            {project.name}
                          </span>
                        </div>
                      </div>

                      {/* Database Connections */}
                      <div>
                        {/* Connections List */}
                        {expandedConnections && (
                          <div className="pl-4 md:pl-5 lg:pl-6 space-y-1">
                            {Object.entries(savedConnections).map(
                              ([dbName, connection]) => {
                                const dbOption = databaseOptions.find(
                                  (db) => db.name === dbName
                                );
                                return (
                                  <div
                                    key={dbName}
                                    className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-md group transition-colors ${
                                      selectedDatabase === dbName
                                        ? "bg-teal-50 border border-teal-200"
                                        : ""
                                    }`}
                                    onClick={() => handleDatabaseClick(dbName)}
                                  >
                                    <div className="flex items-center min-w-0 flex-1">
                                      <span className="text-md mr-2">
                                        {dbOption?.icon}
                                      </span>
                                      <span
                                        className={`${
                                          screenSize === "sm"
                                            ? "text-xs"
                                            : "text-xs"
                                        } text-zinc-700 truncate`}
                                      >
                                        {connection.name}
                                        {selectedDatabase === dbName && (
                                          <span className="ml-2 text-xs text-teal-600">
                                            (Connected)
                                          </span>
                                        )}
                                      </span>
                                    </div>

                                    {/* Action Icons - Edit and Delete */}
                                    <div className="flex items-center space-x-1 ml-2">
                                      <button
                                        className="p-1 text-zinc-500 hover:text-red-600 rounded-full hover:bg-zinc-100 focus:outline-none"
                                        onClick={(e) =>
                                          confirmAndDeleteConnection(dbName, e)
                                        }
                                        title="Delete connection"
                                        aria-label="Delete connection"
                                      >
                                        <Trash2
                                          size={screenSize === "sm" ? 12 : 14}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSidebar;