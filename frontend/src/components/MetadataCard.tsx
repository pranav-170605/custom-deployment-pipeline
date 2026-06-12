import { useState } from "react";
import { Database, Loader, AlertCircle, Search, Info } from "lucide-react";
import { useUser } from "@/context/UserContext";
import axiosClient from "@/lib/axios";

// Define types for your data structure based on the actual API response
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

export default function MetadataFetcherCard() {
  const { ingestionId } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [databaseData, setDatabaseData] = useState<DatabaseResponse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);

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

  // Get all tables from the selected database and schema
  const getTables = () => {
    if (!databaseData || !selectedDatabase || !selectedSchema) return [];

    const db = databaseData.databases.find(
      (db) => db.name === selectedDatabase
    );
    if (!db) return [];

    const schema = db.schemas.find((schema) => schema.name === selectedSchema);
    if (!schema) return [];

    return schema.tables;
  };

  // Filter tables based on search query
  const filteredTables = getTables().filter(
    (table) =>
      !searchQuery ||
      table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count total records across all tables (if rows info is available)
  const getTotalRecords = () => {
    const tables = getTables();
    let total = 0;

    tables.forEach((table) => {
      if (table.rows) {
        total += parseInt(table.rows, 10);
      }
    });

    return total;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden  ">
      {!databaseData ? (
        <div className="p-6">
          <h2 className="text-xl font-bold text-zinc-500 mb-4 flex items-center">
            <Database className="mr-2" size={24} />
            Database Metadata
          </h2>

          <p className="text-zinc-400 mb-4">
            Click the button below to fetch all metadata from your database.
          </p>

          <button
            onClick={fetchMetadata}
            disabled={loading || !ingestionId}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center justify-center disabled:bg-teal-400"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin mr-2" />
                Fetching Metadata...
              </>
            ) : (
              <>
                <Database size={20} className="mr-2" />
                Fetch Database Metadata
              </>
            )}
          </button>

          {!ingestionId && !error && (
            <div className="mt-4 flex items-center p-3 bg-yellow-50 rounded-md text-yellow-700 text-sm">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <p>
                No ingestion job configured. Please set up an ingestion job
                first.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center p-3 bg-red-50 rounded-md text-red-700 text-sm">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Three-column layout */}
          <div className="grid grid-cols-3 divide-x border-b">
            {/* Databases column */}
            <div className="p-4">
              <h2 className="text-md text-zinc-600 font-medium mb-4">Databases</h2>
              <div className="space-y-2">
                {databaseData.databases.map((db) => (
                  <div
                    key={db.name}
                    className={`flex items-center p-2 text-zinc-600 rounded-md cursor-pointer hover:bg-gray-100 ${
                      selectedDatabase === db.name
                        ? "bg-teal-50 text-zinc-600 border-l-4 border-teal-500"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedDatabase(db.name);
                      if (db.schemas.length > 0) {
                        setSelectedSchema(db.schemas[0].name);
                      }
                    }}
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 mr-2">
                      {db.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{db.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schemas column */}
            <div className="p-4">
              <h2 className="text-md text-zinc-600 font-medium mb-4">Schemas</h2>
              {selectedDatabase ? (
                <div className="space-y-2">
                  {databaseData.databases
                    .find((db) => db.name === selectedDatabase)
                    ?.schemas.map((schema) => (
                      <div
                        key={schema.name}
                        className={`flex items-center  p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                          selectedSchema === schema.name
                            ? "bg-teal-50 border-l-4 border-teal-500"
                            : ""
                        }`}
                        onClick={() => setSelectedSchema(schema.name)}
                      >
                        <span className="mr-2 text-zinc-400">
                          {schema.name}
                        </span>
                        {schema.tables.length > 0 && (
                          <Info size={16} className="text-teal-500" />
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-zinc-500">Select a database first</p>
              )}
            </div>

            {/* Tables column */}
            <div className="p-4">
              <h2 className="text-md text-zinc-600 font-medium mb-4">Tables</h2>

              {/* Search input */}
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  className="pl-8 block w-full rounded-md border border-gray-300 shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {selectedSchema ? (
                <>
                  <div className="space-y-1">
                    {filteredTables.length > 0 ? (
                      filteredTables.map((table) => (
                        <div
                          key={table.name}
                          className="text-teal-600 hover:text-teal-800 cursor-pointer py-1"
                        >
                          {table.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-500">No tables found</p>
                    )}
                  </div>

                  {filteredTables.length > 0 && (
                    <div className="mt-6 text-sm text-zinc-500">
                      {filteredTables.length} tables, {getTotalRecords()} total
                      records
                    </div>
                  )}
                </>
              ) : (
                <p className="text-zinc-500">Select a schema first</p>
              )}
            </div>
          </div>

          {/* Table details section */}
          {selectedSchema && filteredTables.length > 0 && (
            <div className="p-6">
              <h3 className="text-lg font-medium mb-3">Table Details</h3>
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
                        Columns
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                      >
                        Rows
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTables.map((table) => (
                      <tr key={table.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                          {table.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {table.type || "Table"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {table.columns?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {table.rows || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {table.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Refresh button */}
          {/* <div className="p-4 flex justify-end">
            <button
              onClick={fetchMetadata}
              disabled={loading}
              className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center justify-center disabled:bg-teal-400"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Database size={16} className="mr-2" />
                  Refresh Metadata
                </>
              )}
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}
