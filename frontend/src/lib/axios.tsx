// lib/axios.ts
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://192.168.4.201:31211",
  headers: {
    "Content-Type": "application/json",
  },
  // Increase timeout if needed
  timeout: 10000,
});

// Add request interceptor for debugging
axiosClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Log outgoing requests
    console.log(
      `🚀 ${config.method?.toUpperCase()} ${config.url}`,
      config.data
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`❌ Error ${error.response.status}:`, error.response.data);

      // Special handling for validation errors
      if (error.response.status === 422) {
        console.error("Validation errors:", error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
