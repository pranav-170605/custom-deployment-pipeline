"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import axiosClient from "@/lib/axios";
import {
  Server,
  Database,
  Clock,
  Cpu,
  HardDrive,
  Activity,
  Shield,
  Users,
  Lock,
  Save,
  Loader,
  AlertCircle,
} from "lucide-react";

interface MetadataTabProps {
  databaseType: string;
  connectionString: string;
  workspaceId: string;
  selectedDatabase: string;
  selectedSchema: string;
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;
  databaseData: any;
}

interface MetadataResponse {
  overview: {
    database: string;
    server: string;
    source_name: string;
    running_since: string;
  };
  performance: {
    cpu_usage: string;
    memory_usage: string;
    queries_per_sec: string;
  };
  security: {
    user_roles: string[];
    ssl_enabled: string;
    last_backup: string;
  };
}

const MetadataTab: React.FC<MetadataTabProps> = ({
  databaseType,
  connectionString,
  workspaceId,
  selectedDatabase,
  selectedSchema,
  selectedTable,
  setSelectedTable,
  databaseData,
}) => {
  const { ingestionId } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, [ingestionId]);

  const fetchMetadata = async () => {
    setLoading(true);
    setError(null);

    if (!ingestionId) {
      setError(
        "No ingestion ID found. Please configure an ingestion job first."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axiosClient.get(
        `/usage/ingestion_metadata/${ingestionId}`
      );
      setMetadata(response.data);
    } catch (err) {
      console.error("Error fetching metadata:", err);
      setError(
        "Failed to fetch database metadata. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={24} className="animate-spin text-teal-600 mr-2" />
        <span className="text-gray-600">Loading database metadata...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <AlertCircle size={32} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMetadata}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6">
          <Database size={32} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Metadata
          </h3>
          <p className="text-gray-500 mb-4">Database metadata not available</p>
          <button
            onClick={fetchMetadata}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Fetch Metadata
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Database Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-medium mb-4 text-teal-700 flex items-center">
            <Database className="mr-2" size={20} />
            Overview
          </h3>
          <div className="space-y-4 text-zinc-500">
            <InfoItem
              icon={<Database size={18} />}
              label="Database Type"
              value={metadata.overview.database}
            />
            <InfoItem
              icon={<Server size={18} />}
              label="Server"
              value={metadata.overview.server}
            />
            <InfoItem
              icon={<Database size={18} />}
              label="Source Name"
              value={metadata.overview.source_name}
            />
            <InfoItem
              icon={<Clock size={18} />}
              label="Running Since"
              value={metadata.overview.running_since}
            />
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-medium mb-4 text-teal-700 flex items-center">
            <Activity className="mr-2" size={20} />
            Performance
          </h3>
          <div className="space-y-4 text-zinc-500">
            <InfoItem
              icon={<Cpu size={18} />}
              label="CPU Usage"
              value={metadata.performance.cpu_usage}
            />
            <InfoItem
              icon={<HardDrive size={18} />}
              label="Memory Usage"
              value={metadata.performance.memory_usage}
            />
            <InfoItem
              icon={<Activity size={18} />}
              label="Queries Per Second"
              value={metadata.performance.queries_per_sec}
            />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-medium mb-4 text-teal-700 flex items-center">
            <Shield className="mr-2" size={20} />
            Security
          </h3>
          <div className="space-y-4 text-zinc-500">
            <div className="flex items-start">
              <Users size={18} className="mr-3 text-teal-600 mt-1" />
              <div>
                <div className="font-medium">User Roles</div>
                <div className="text-gray-600 max-h-24 overflow-y-auto">
                  {metadata.security.user_roles.join(", ")}
                </div>
              </div>
            </div>
            <InfoItem
              icon={<Lock size={18} />}
              label="SSL Enabled"
              value={metadata.security.ssl_enabled}
            />
            <InfoItem
              icon={<Save size={18} />}
              label="Last Backup"
              value={metadata.security.last_backup}
            />
          </div>
        </div>
      </div>

      {/* Structure Summary */}
      {databaseData && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">
            Database Structure
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StructureItem
                title="Databases"
                value={`${databaseData.databases?.length || 0} databases`}
              />
              <StructureItem
                title="Schemas"
                value={`${
                  databaseData.databases?.reduce(
                    (acc: number, db: any) => acc + (db.schemas?.length || 0),
                    0
                  ) || 0
                } schemas`}
              />
              <StructureItem
                title="Tables"
                value={`${
                  databaseData.databases?.reduce((acc: number, db: any) => {
                    return (
                      acc +
                      (db.schemas?.reduce(
                        (schemaAcc: number, schema: any) =>
                          schemaAcc + (schema.tables?.length || 0),
                        0
                      ) || 0)
                    );
                  }, 0) || 0
                } tables`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start">
    <div className="mr-3 text-teal-600 mt-1">{icon}</div>
    <div>
      <div className="font-medium">{label}</div>
      <div className="text-gray-600">{value}</div>
    </div>
  </div>
);

const StructureItem = ({ title, value }: { title: string; value: string }) => (
  <div>
    <h4 className="font-medium text-teal-700 mb-2">{title}</h4>
    <p className="text-gray-600">{value}</p>
  </div>
);

export default MetadataTab;
