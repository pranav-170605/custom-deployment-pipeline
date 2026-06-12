
import { useUser } from "@/context/UserContext";
import axiosClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface IngestionService {
  name: string;
}

export interface IngestionPayload {
  name: string;
  ingestion_type: string;
  database_filter_pattern: {
    includes: string;
    excludes: string;
  };
  schema_filter_pattern: {
    includes: string;
    excludes: string;
  };
  table_filter_pattern: {
    includes: string;
    excludes: string;
  };
  enable_debug_log: boolean;
  mark_deleted_tables: boolean;
}

export interface SchedulePayload {
  schedule_type: "schedule" | "on-demand";
  frequency: string;
  hour: number;
  minute: number;
  retries: number;
}

export interface IngestionData {
  id: string;
  name: string;
  type: string;
  status: string;
  last_run: string;
  next_run: string;
  tables_count: number;
  schemas_count: number;
  // Add other fields that come from your GET API
}

// Hooks for the main POST operations
export const useConfigureIngestion = () => {
  const { userId, srcConnId, setIngestionId } = useUser();
  
  return useMutation({
    mutationFn: (payload: IngestionPayload) => {
      if (!srcConnId) {
        throw new Error("Source Connection ID is required to configure ingestion");
      }
      
      console.log("🔄 Configuring ingestion with payload:", payload);
      console.log("🔄 Using srcConnId:", srcConnId);
      
      return axiosClient
        .post(`/ingestion/create-ingestion-job/${srcConnId}`, {
          ...payload,
        })
        .then((res) => {
          console.log("✅ Ingestion configured successfully:", res.data);
          
          // Store the ingestion ID from the response
          if (res.data.ingestion_id) {
            console.log(
              "🔐 Storing ingestion_id in context and localStorage:",
              res.data.ingestion_id
            );
            setIngestionId(res.data.ingestion_id);
          }
          return res.data;
        });
    },
  });
};

export const useScheduleIngestion = () => {
  const { ingestionId } = useUser();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: SchedulePayload) => {
      if (!ingestionId) {
        throw new Error("Ingestion ID is required to schedule ingestion");
      }
      
      console.log(
        "🔄 Using ingestionId from context for scheduling:",
        ingestionId
      );
      console.log("🔄 Schedule payload:", payload);
      
      return axiosClient
        .post(`/ingestion/create-ingestion-config/${ingestionId}`, payload)
        .then((res) => {
          console.log("✅ Ingestion scheduled successfully:", res.data);
          return res.data;
        });
    },
    onSuccess: () => {
      // Immediately trigger the fetch after successful scheduling
      console.log("🔄 Schedule successful, triggering ingestion data fetch");
      queryClient.invalidateQueries({ queryKey: ["ingestionData", ingestionId] });
      
      // Fetch data immediately without waiting for invalidation
      queryClient.fetchQuery({
        queryKey: ["ingestionData", ingestionId],
        queryFn: async () => {
          if (!ingestionId) {
            throw new Error("Ingestion ID is required to fetch data");
          }
          
          console.log("🔄 Immediately fetching ingestion data for ID:", ingestionId);
          // const response = await axiosClient.get(`/metadata/${ingestionId}/all`);
          // console.log("✅ Ingestion data fetched successfully:", response.data);
          // return response.data;
        }
      });
    }
  });
};

// New hook to run ingestion job
export const useRunIngestionJob = () => {
  const { ingestionId } = useUser();
  
  return useMutation({
    mutationFn: () => {
      if (!ingestionId) {
        throw new Error("Ingestion ID is required to run ingestion job");
      }
      
      console.log("🔄 Running ingestion job for ID:", ingestionId);
      
      return axiosClient
        .post(`/ingestion/run-ingestion-job/${ingestionId}`)
        .then((res) => {
          console.log("✅ Ingestion job started successfully:", res.data);
          return res.data;
        });
    },
  });
};

// Hook to fetch ingestion data
export const useFetchIngestionData = () => {
  const { ingestionId } = useUser();
  
  return useQuery({
    queryKey: ["ingestionData", ingestionId],
    queryFn: async () => {
      if (!ingestionId) {
        throw new Error("Ingestion ID is required to fetch data");
      }
      
      console.log("🔄 Fetching ingestion data for ID:", ingestionId);
      const response = await axiosClient.get(`/metadata/${ingestionId}/all`);
      console.log("✅ Ingestion data fetched successfully:", response.data);
      return response.data;
    },
    enabled: !!ingestionId, // Only run the query if ingestionId exists
    refetchOnWindowFocus: false,
  });
};