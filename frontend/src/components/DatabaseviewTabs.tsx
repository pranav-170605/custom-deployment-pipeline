"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Info,
  Calendar,
  Lock,
  Users,
  Database,
  Loader,
  AlertCircle,
} from "lucide-react";
import MetadataTab from "./Metadatatab";
import Schematab from "./Schematab";
import SampleDataTab from "./Sampledatatab";
import LineageTab from "./Linagetab";
import axiosClient from "@/lib/axios";
import { useUser } from "@/context/UserContext";
// import Schemadata from "./Schematab";
// import ERDiagramTab from '../components/ERdiagramtab';
// import TableProfileTab from '../components/Tableprofiltab';
// import ColumnProfileTab from './tabs/ColumnProfileTab';
// import DataQualityTab from './tabs/DataQualityTab';

// Interfaces for database metadata
interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

interface Table {
  name: string;
  columns: Column[];
  rows: string | null;
  description: string | null;
  type: string;
}

interface Schema {
  name: string;
  tables: Table[];
}

interface Database {
  name: string;
  schemas: Schema[];
  type: string | null;
  icon: string | null;
}

interface DatabaseResponse {
  databases: Database[];
}

interface DatabaseViewProps {
  databaseType: string;
  connectionString: string;
  workspaceId: string;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({
  databaseType,
  connectionString,
  workspaceId,
}) => {
  const { ingestionId } = useUser();
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [showSchemaDetails, setShowSchemaDetails] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("metadata");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [databaseData, setDatabaseData] = useState<DatabaseResponse | null>(
    null
  );
  const [tableDetails, setTableDetails] = useState<Table | null>(null);

  useEffect(() => {
    // Fetch metadata when component mounts
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
      console.log("🔄 Fetching ingestion data for ID:", ingestionId);
      const response = await axiosClient.get(`/metadata/${ingestionId}/all`);
      console.log("✅ Ingestion data fetched successfully:", response.data);

      setDatabaseData(response.data);

      // Set default selections if data exists
      if (response.data.databases && response.data.databases.length > 0) {
        setSelectedDatabase(response.data.databases[0].name);

        if (
          response.data.databases[0].schemas &&
          response.data.databases[0].schemas.length > 0
        ) {
          setSelectedSchema(response.data.databases[0].schemas[0].name);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching metadata:", err);
      setError(
        "Failed to fetch database metadata. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Find current selected table
  useEffect(() => {
    if (databaseData && selectedDatabase && selectedSchema && selectedTable) {
      const db = databaseData.databases.find(
        (db) => db.name === selectedDatabase
      );
      if (db) {
        const schema = db.schemas.find(
          (schema) => schema.name === selectedSchema
        );
        if (schema) {
          const table = schema.tables.find(
            (table) => table.name === selectedTable
          );
          if (table) {
            setTableDetails(table);
          }
        }
      }
    } else {
      setTableDetails(null);
    }
  }, [databaseData, selectedDatabase, selectedSchema, selectedTable]);

  const tabs = [
    "Metadata",
    "Schema",
    "Sample Data",
    "Lineage",
    "ER Diagram",
    "Table Profile",
    "Column Profile",
    "Data Quality",
  ];

  const renderActiveTab = () => {
    // If still loading or error, show appropriate UI
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

    if (!databaseData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center p-6">
            <Database size={32} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Database Data
            </h3>
            <p className="text-gray-500 mb-4">
              Database metadata not available
            </p>
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

    const commonProps = {
      databaseType,
      connectionString,
      workspaceId,
      selectedDatabase,
      selectedSchema,
      selectedTable,
      setSelectedTable,
      databaseData,
    };

    switch (activeTab) {
      case "metadata":
        return <MetadataTab {...commonProps} />;
      case "schema":
        return (
          <Schematab
            {...commonProps}
            setShowSchemaDetails={setShowSchemaDetails}
            setSelectedSchema={setSelectedSchema}
          />
        );
      case "sample-data":
        return <SampleDataTab {...commonProps} />;
      case "lineage":
        return <LineageTab {...commonProps} />;
      // case 'er-diagram':
      //   return <ERDiagramTab {...commonProps} />;
      // case 'table-profile':
      //   return <TableProfileTab {...commonProps} />;
      // case 'column-profile':
      //   return <ColumnProfileTab {...commonProps} />;
      // case 'data-quality':
      //   return <DataQualityTab {...commonProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2 text-gray-700">
                {tabs.find(
                  (tab) => tab.toLowerCase().replace(" ", "-") === activeTab
                )}{" "}
                View
              </h3>
              <p className="text-gray-500">
                This tab is currently being developed.
              </p>
            </div>
          </div>
        );
    }
  };

  const renderSchemaDetails = () => {
    if (!showSchemaDetails || !selectedSchema || !databaseData) return null;

    // Find the current schema from dynamic data
    const db = databaseData.databases.find(
      (db) => db.name === selectedDatabase
    );
    if (!db) return null;

    const schematab = db.schemas.find(
      (schema) => schema.name === selectedSchema
    );
    if (!schematab) return null;
  };

  return (
    <div className="bg-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <ChevronLeft size={20} className="mr-2" />
        <div>
          <h2 className="text-lg font-medium">{databaseType} Database</h2>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area with tabs */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex justify-start">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-medium text-sm relative ${
                    activeTab === tab.toLowerCase().replace(" ", "-")
                      ? "text-teal-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() =>
                    setActiveTab(tab.toLowerCase().replace(" ", "-"))
                  }
                >
                  {tab}
                  {activeTab === tab.toLowerCase().replace(" ", "-") && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">{renderActiveTab()}</div>
        </div>

        {/* Schema and Table details pane */}
        {renderSchemaDetails()}
      </div>
    </div>
  );
};

export default DatabaseView;
