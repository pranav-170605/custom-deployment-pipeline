import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Database,
  Loader,
  AlertCircle,
  Calendar,
  Lock,
  Users,
} from "lucide-react";
import axiosClient from "@/lib/axios";
import { useUser } from "@/context/UserContext";

// Updated interface definitions to match the backend API response
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

interface SchematabProps {
  databaseType: string;
  connectionString: string;
  workspaceId: string;
  selectedDatabase: string;
  selectedSchema: string;
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;
  setShowSchemaDetails: (show: boolean) => void;
  setSelectedSchema: (schema: string) => void;
  databaseData: any; // This will be ignored as we'll fetch fresh data
}

const Schematab: React.FC<SchematabProps> = ({
  databaseType,
  connectionString,
  workspaceId,
  selectedDatabase: initialSelectedDatabase,
  selectedSchema: initialSelectedSchema,
  selectedTable,
  setSelectedTable,
  setShowSchemaDetails,
  setSelectedSchema,
}) => {
  const { ingestionId } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [databaseData, setDatabaseData] = useState<DatabaseResponse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(
    initialSelectedDatabase || null
  );
  const [localSelectedSchema, setLocalSelectedSchema] = useState<string | null>(
    initialSelectedSchema || null
  );
  const [tableDetails, setTableDetails] = useState<Table | null>(null);

  useEffect(() => {
    // Fetch metadata when component mounts
    fetchMetadata();
  }, [ingestionId]);

  // Update parent component's state when local state changes
  useEffect(() => {
    if (localSelectedSchema) {
      setSelectedSchema(localSelectedSchema);
    }
  }, [localSelectedSchema, setSelectedSchema]);

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
        setSelectedDatabase(
          (prevSelected) => prevSelected || response.data.databases[0].name
        );

        if (
          response.data.databases[0].schemas &&
          response.data.databases[0].schemas.length > 0
        ) {
          setLocalSelectedSchema(
            (prevSelected) =>
              prevSelected || response.data.databases[0].schemas[0].name
          );
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

  // Get all tables from the selected database and schema
  const getTables = () => {
    if (!databaseData || !selectedDatabase || !localSelectedSchema) return [];

    const db = databaseData.databases.find(
      (db) => db.name === selectedDatabase
    );
    if (!db) return [];

    const schema = db.schemas.find(
      (schema) => schema.name === localSelectedSchema
    );
    if (!schema) return [];

    return schema.tables;
  };

  // Filter tables based on search query
  const filteredTables = getTables().filter(
    (table) =>
      !searchQuery ||
      table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle table selection
  const handleTableClick = (table: Table) => {
    setSelectedTable(table.name);
    setTableDetails(table);
    setShowSchemaDetails(true);
  };

  // Get current schema data
  const getCurrentSchema = () => {
    if (!databaseData || !selectedDatabase || !localSelectedSchema) return null;

    const db = databaseData.databases.find(
      (db) => db.name === selectedDatabase
    );
    if (!db) return null;

    return db.schemas.find((schema) => schema.name === localSelectedSchema);
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

  if (!databaseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6">
          <Database size={32} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Database Data
          </h3>
          <p className="text-gray-500 mb-4">Database metadata not available</p>
          <button
            onClick={fetchMetadata}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Fetch Metadata
          </button>
        </div>
      </div>
    );
  }

  // Get the current schema object
  const currentSchema = getCurrentSchema();

  return (
    <div className="flex h-full">
      {/* Left side: Database and schema selection */}
      <div className="w-1/4 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-medium text-gray-700 mb-4">Databases</h3>

        {databaseData.databases.map((database) => (
          <div key={database.name} className="mb-4">
            <button
              className={`flex items-center text-zinc-700 justify-between w-full text-left p-2 rounded-md ${
                selectedDatabase === database.name
                  ? "bg-white-50 text-zinc-500"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedDatabase(database.name);
                if (database.schemas.length > 0) {
                  setLocalSelectedSchema(database.schemas[0].name);
                }
              }}
            >
              <div className="flex items-center">
                <span className="w-8 h-8 bg-teal-100 text-zinc-500 rounded-full flex items-center justify-center mr-2">
                  {database.name.charAt(0).toUpperCase()}
                </span>
                <span>{database.name}</span>
              </div>
              <ChevronRight
                size={16}
                className={
                  selectedDatabase === database.name
                    ? "text-zinc-500"
                    : "text-gray-400"
                }
              />
            </button>

            {selectedDatabase === database.name && (
              <div className="ml-10 mt-2 space-y-1">
                {database.schemas.map((schema) => (
                  <button
                    key={schema.name}
                    className={`w-full text-left p-2 rounded-md ${
                      localSelectedSchema === schema.name
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setLocalSelectedSchema(schema.name);
                      setTableDetails(null); // Clear table details when switching schemas
                      setSelectedTable(null);
                    }}
                  >
                    {schema.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side: Tables list and details */}
      <div className="w-3/4 p-4 overflow-y-auto">
        {/* Schema header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedDatabase} / {localSelectedSchema}
          </h2>

          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 block w-64 rounded-md border border-gray-300 shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {tableDetails ? (
          // Table details view - shown when a table is selected
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => {
                setTableDetails(null);
                setSelectedTable(null);
              }}
              className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
            >
              <ChevronRight
                size={16}
                className="transform rotate-180 mr-1"
              />
              <span>Back to tables</span>
            </button>

            {/* Table Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-xl text-teal-700">
                  {tableDetails.name}
                </h4>
                <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">
                  {tableDetails.type || "Table"}
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                {tableDetails.description || "No description available"}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Columns</span>
                  <p className="font-medium text-gray-900">
                    {tableDetails.columns?.length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Rows</span>
                  <p className="font-medium text-gray-900">
                    {tableDetails.rows || "0"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Schema</span>
                  <p className="font-medium text-gray-900">{localSelectedSchema}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Database</span>
                  <p className="font-medium text-gray-900">{selectedDatabase}</p>
                </div>
              </div>

              <h5 className="text-lg font-medium mb-4">Columns</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                      >
                        Nullable
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableDetails.columns?.map((column, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                          {column.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {column.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {column.nullable ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schema Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-lg flex items-center">
                  <span className="mr-2">📋</span> {localSelectedSchema}
                </h4>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                  {currentSchema?.tables?.length || 0} tables
                </span>
              </div>
              <p className="text-gray-600 mb-6">{currentSchema?.name}</p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <Users size={18} className="mr-3 text-teal-600 mt-1" />
                  <div>
                    <div className="font-medium">Owner</div>
                    <div className="text-gray-600">Database Admin</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar size={18} className="mr-3 text-teal-600 mt-1" />
                  <div>
                    <div className="font-medium">Tables</div>
                    <div className="text-gray-600">
                      {currentSchema?.tables?.length || 0} tables
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Lock size={18} className="mr-3 text-teal-600 mt-1" />
                  <div>
                    <div className="font-medium">Privileges</div>
                    <div className="text-gray-600">ALL</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Database size={18} className="mr-3 text-teal-600 mt-1" />
                  <div>
                    <div className="font-medium">Database</div>
                    <div className="text-gray-600">{selectedDatabase}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Tables grid - shown when no table is selected
          <div className="grid grid-cols-3 gap-4">
            {filteredTables.length > 0 ? (
              filteredTables.map((table) => (
                <div
                  key={table.name}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleTableClick(table)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-teal-700">{table.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {table.type || "Table"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {table.description || "No description available"}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{table.columns?.length || 0} columns</span>
                    <span>{table.rows || "0"} rows</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">
                    No tables found matching your search
                  </p>
                  {searchQuery && (
                    <button
                      className="text-teal-600 hover:text-teal-700 text-sm"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schematab;