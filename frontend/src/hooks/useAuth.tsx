import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/axios";
import { useUser } from "@/context/UserContext";

type LoginPayload = {
  username: string;
  password: string;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type WorkspacePayload = {
  name: string;
  description: string;
  project: {
    name: string;
    description: string;
  };
};

// LOGIN //
export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) =>
      axiosClient.post("/users/login", payload).then((res) => res.data),
  });

// REGISTER //
export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) =>
      axiosClient.post("/users/register", payload).then((res) => res.data),
  });

// FETCH USER WORKSPACES //
export const useFetchWorkspaces = (enabled = true) => {
  const { userId } = useUser();

  return useQuery({
    queryKey: ["workspaces", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No userId available for fetching workspaces");
        return { workspace: null, projects: [] };
      }

      console.log("Fetching workspaces for userId:", userId);

      try {
        // Make sure the endpoint matches exactly what your backend expects
        const response = await axiosClient.get(`/workspaces/user/${userId}`);

        // Enhanced logging to debug the response
        console.log("Workspaces fetch response:", response.data);

        // Return a properly structured response that the components can use
        return {
          workspace: response.data.workspace || null,
          projects: response.data.projects || [],
        };
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        throw error;
      }
    },
    enabled: !!userId && enabled,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    // Add retry logic for network issues
    retry: 3,
    retryDelay: (attempt) =>
      Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
  });
};

// CREATE WORKSPACE //
export const useCreateWorkspace = () => {
  const { userId, setWorkspaceId, setProjectId } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WorkspacePayload) => {
      if (!userId) {
        throw new Error("User ID not available yet");
      }

      // Log request details for debugging
      console.log("Creating workspace with:", {
        url: `/workspaces/user/workspace/${userId}`,
        payload: JSON.stringify(payload),
        userId,
      });

      try {
        const response = await axiosClient.post(
          `/workspaces/user/workspace/${userId}`,
          payload
        );
        console.log("Workspace creation response received:", response.data);

        // Extract workspace ID
        const workspaceId = response.data.workspace_id;
        if (workspaceId) {
          // Store in localStorage
          localStorage.setItem("workspaceId", workspaceId);
          console.log("✅ workspaceId stored in localStorage:", workspaceId);

          // Update context
          setWorkspaceId(workspaceId);
          console.log("✅ workspaceId set in context:", workspaceId);
        } else {
          console.warn("⚠️ workspaceId not found in response");
        }

        // Extract project ID
        const projectId = response.data?.project?.project_id;
        if (projectId) {
          // Store in localStorage
          localStorage.setItem("projectId", projectId);
          console.log("✅ projectId stored in localStorage:", projectId);

          // Update context
          setProjectId(projectId);
          console.log("✅ projectId set in context:", projectId);
        } else {
          console.warn("⚠️ projectId not found in response");
        }

        return response.data;
      } catch (error: any) {
        // Enhanced error logging
        console.error("Workspace creation error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Immediately invalidate and refetch workspaces to update sidebar
      console.log(
        "Workspace created successfully, invalidating workspaces cache"
      );
      queryClient.invalidateQueries({ queryKey: ["workspaces", userId] });

      // Immediately refetch workspaces data
      queryClient.refetchQueries({ queryKey: ["workspaces", userId] });
    },
  });
};

export { useUser };
// Additional hooks can be added here...

// SOURCE CONNECTION //
// More hooks for your application...
