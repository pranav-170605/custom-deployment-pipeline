"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios";
import { useUser } from "@/context/UserContext";

// Define the structure expected by the save connection endpoint
export interface ConnectionData {
  connection_name: string;
  source_name: string;
  connection_details: {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
  };
}

// Define the simplified structure expected by the test connection endpoint
export interface TestConnectionData {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

// Response type for a connection from the GET API
export interface ConnectionResponse {
  src_conn_id: string;
  connection_name: string;
  source_name: string;
  connection_details: {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
  };
  created_at: string;
  updated_at: string;
}
/**

 * Posts to /source-connections/source-connections/{project_id}
 */
export const useCreateConnection = () => {
  const { projectId } = useUser();
  const { setSrcConnId } = useUser();

  return useMutation({
    mutationFn: async (connectionData: ConnectionData) => {
      if (!projectId) {
        throw new Error(
          "Project ID not available. Please ensure you have a project selected."
        );
      }

      // Log request details for debugging
      console.log("Creating database connection:", {
        url: `/source-connections/source-connections/${projectId}`,
        payload: connectionData,
        projectId,
      });

      try {
        const response = await axiosClient.post(
          `/source-connections/source-connections/${projectId}`,
          connectionData
        );
        console.log("Connection created successfully:", response.data);
        // Source Connection ID storing //
        const srcConnId = response.data?.src_conn_id;
        if (srcConnId) {
          localStorage.setItem("srcConnId", srcConnId);
          setSrcConnId(srcConnId);
          console.log(
            "✅ srcConnId set in localStorage and context:",
            srcConnId
          );

          setTimeout(() => {
            const verify = localStorage.getItem("srcConnId");
            console.log("Verification - srcConnId in localStorage:", verify);
          }, 100);
        } else {
          console.warn("⚠️ src_conn_id not found in response");
        }

        return response.data;
      } catch (error: any) {
        console.error("Failed to create connection:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    },
  });
};

/**
 * Hook for testing a database connection before saving
 * Posts to /connection-tester/test-postgres-connection
 */
export const useTestConnection = () => {
  return useMutation({
    // Use the simplified TestConnectionData structure for test endpoint
    mutationFn: async (testData: TestConnectionData) => {
      console.log("Testing connection with data:", testData);

      try {
        const response = await axiosClient.post(
          "/connection-tester/test-postgres-connection",
          testData
        );

        console.log("Connection test result:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("Connection test failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    },
  });
};

/**
 * Hook for fetching a connection by ID
 * Gets from /source-connections/source-connections/{src_conn_id}
 */
export const useGetConnection = () => {
  const { srcConnId } = useUser();

  return useQuery({
    queryKey: ["connection", srcConnId],
    queryFn: async (): Promise<ConnectionResponse> => {
      if (!srcConnId) {
        throw new Error(
          "Source Connection ID not available. Please ensure you have a connection selected."
        );
      }

      console.log("Fetching connection details:", {
        url: `/source-connections/source-connections/${srcConnId}`,
        srcConnId,
      });

      try {
        const response = await axiosClient.get(
          `/source-connections/source-connections/${srcConnId}`
        );
        console.log("Connection details fetched successfully:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("Failed to fetch connection details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    },
    enabled: !!srcConnId, // Only run the query if srcConnId exists
  });
};
