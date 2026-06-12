"use client";

import Link from "next/link";
import {
  useState,
  useEffect,
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import Header from "../../components/Header";
import Button from "../../ui-components/Button";
import { useRouter } from "next/navigation";
import { useCreateWorkspace } from "../../hooks/useAuth";
import { useFetchWorkspaces } from "../../hooks/useAuth"; // Added import for fetching workspaces
import { CreateWorkspaceModal } from "../../components/CreateWorkspaceModal";
import IconBar from "@/components/Iconbar";
import { useUser } from "../../hooks/useAuth"; // Add useUser to get the current user
import { data } from "react-router-dom";

const Dashboard = () => {
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { userId } = useUser();
  const createWorkspaceMutation = useCreateWorkspace(); // ✅ Call at top level
  // Get userId for workspace operations

  // Fetch workspaces using the provided hook
  const {
    data: workspaceData,
    refetch: refetchWorkspaces,
    isLoading: isLoadingWorkspaces,
  } = useFetchWorkspaces();

  // Effect to hide welcome card when workspace data is available
  useEffect(() => {
    if (workspaceData && workspaceData.workspace) {
      setShowWelcomeCard(false);
    }
  }, [workspaceData]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Handles the creation of a new workspace.
   *
   * @param data - An object containing workspace and project details.
   * @param data.workspace - The workspace details including name and description.
   * @param data.project - The project details including name and description.
   *
   * This function will update the UI state to reflect the workspace creation process,
   * hide the welcome card, close the modal, and reset the loading state.
   */

  /*******  fda411f4-02a6-441b-959e-a5c49f663bae  *******/
  // Modified handleCreateWorkspace function
  const handleCreateWorkspace = async (data: {
    name: string;
    description: string;
    project: { name: string; description: string };
  }) => {
    setIsCreatingWorkspace(true);
    try {
      await createWorkspaceMutation.mutateAsync(data); // ✅ Reuse the mutation here
      setShowWelcomeCard(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handlePremiumClick = () => {
    console.log("Premium clicked");
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar - dynamic width based on collapsed state */}
      <div
        className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <IconBar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      </div>

      {/* Main Content - flex-grow to take remaining space */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header - full width of the content area */}
        <Header
          profileInitial="A"
          onNotificationClick={handleNotificationClick}
          onPremiumClick={handlePremiumClick}
          onProfileClick={handleProfileClick}
        />

        {/* Main Content Area - scrollable */}
        <main className="flex-grow justify-center items-center  overflow-y-auto p-4 bg-gray-50">
          {/* Welcome Card */}
          {showWelcomeCard && (
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-8 text-white mb-8 shadow-md flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Welcome to IK-EDA!
              </h2>
              <p className="text-base leading-relaxed mb-6 max-w-xl">
                Ready to build, design, and test your data analysis with IK-EDA
                whether you're just getting started or a seasoned pro, we've got
                tools to help you build reliable, production-ready analytics.
              </p>
              <div className="">
                <Button
                  onClick={handleOpenModal}
                  disabled={isCreatingWorkspace}
                  className="custom-create-workspace-btn"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 5V19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Create Workspace
                </Button>
              </div>
            </div>
          )}

          {/* Workspace Data Section - Show when data is available */}
          {workspaceData && workspaceData.workspace && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="mb-3 font-semibold text-lg text-black flex items-center">
                <span>Your Workspace</span>
                {isLoadingWorkspaces && (
                  <span className="ml-2 inline-block w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
                )}
              </h2>

              <div className="mb-4">
                <h3 className="font-medium text-black">
                  {workspaceData.workspace.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {workspaceData.workspace.description}
                </p>
              </div>

              {workspaceData.projects && workspaceData.projects.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Projects:
                  </h4>
                  <ul className="space-y-2">
                    {workspaceData.projects.map(
                      (project: {
                        id: Key | null | undefined;
                        name:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<AwaitedReactNode>
                          | null
                          | undefined;
                        description:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<AwaitedReactNode>
                          | null
                          | undefined;
                      }) => (
                        <li
                          key={project.id}
                          className="p-3 bg-gray-50 rounded-md"
                        >
                          <div className="font-medium text-black">
                            {project.name}
                          </div>
                          <p className="text-sm text-gray-600">
                            {project.description}
                          </p>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No projects found</p>
              )}

              <div className="mt-4">
                <Button
                  onClick={handleOpenModal}
                  className="text-sm bg-teal-50 text-teal-700 hover:bg-teal-100"
                >
                  Add Project
                </Button>
              </div>
            </div>
          )}

          {/* Discover Section */}
          <div className="mb-4 bg-white p-4 rounded-lg">
            <h2 className="mb-1 font-semibold text-black">
              Discover what you can do in IK-EDA
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Explore the full potential of data analysis with interactive
              visualization templates.
            </p>
          </div>

          {/* Cards Grid - responsive columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overview Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-teal-50 mb-4">
                <svg
                  className="h-6 w-6 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg text-black font-semibold mb-2">
                Overview
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get a comprehensive view of your data analysis pipeline and
                project status.
              </p>
              <Link
                href="#"
                className="text-teal-600 text-sm flex items-center"
              >
                Learn more
                <svg
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Data Analysis Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 mb-4">
                <svg
                  className="h-6 w-6 text-teal-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg text-black font-semibold mb-2">
                Data Analysis
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Powerful tools for analyzing and understanding your data
                patterns.
              </p>
              <Link
                href="#"
                className="text-teal-600 text-sm flex items-center"
              >
                Explore tools
                <svg
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Visualization Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-teal-50 mb-4">
                <svg
                  className="h-6 w-6 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg text-black font-semibold mb-2">
                Visualization Documentation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Create and document beautiful data visualizations to communicate
                your findings effectively.
              </p>
              <Link
                href="#"
                className="text-teal-600 text-sm flex items-center"
              >
                View examples
                <svg
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateWorkspace={handleCreateWorkspace}
        isLoading={isCreatingWorkspace}
      />
    </div>
  );
};

export default Dashboard;
function setSidebarCollapsed(arg0: boolean) {
  throw new Error("Function not implemented.");
}

