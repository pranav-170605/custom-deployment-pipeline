import { useState, useEffect, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, SetStateAction } from 'react';
import { Database, Search } from 'lucide-react';

export default function DatabaseView({ databaseData, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [selectedSchema, setSelectedSchema] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  
  // Process database data when it changes
  useEffect(() => {
    if (databaseData?.databases?.length > 0) {
      setSelectedDatabase(databaseData.databases[0].name);
      
      if (databaseData.databases[0].schemas?.length > 0) {
        setSelectedSchema(databaseData.databases[0].schemas[0].name);
      }
    }
  }, [databaseData]);
  
  // Get current database object
  const currentDatabase = databaseData?.databases?.find((db: { name: string; }) => db.name === selectedDatabase) || { schemas: [] };
  
  // Get current schema object
  const currentSchema = currentDatabase.schemas?.find((schema: { name: string; }) => schema.name === selectedSchema) || { tables: [] };
  
  // Filter tables based on search query
  const filteredTables = currentSchema.tables?.filter((table: { name: string; description: string; }) => 
    table.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (table.description && table.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Calculate total tables and records
  const totalTables = filteredTables.length;
  const totalRecords = filteredTables.reduce((acc: any, table: { rows: any; }) => acc + (table.rows || 0), 0) || 38905;

  // For debugging
  console.log("Database Data:", databaseData);
  console.log("Current Database:", currentDatabase);
  console.log("Current Schema:", currentSchema);
  console.log("Filtered Tables:", filteredTables);

  // If data is still loading
  if (!databaseData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">Loading database metadata...</p>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-white">
      {/* Left sidebar */}
      <div className="w-64 border-r border-gray-200">
        {/* Database selector */}
        <div className="p-4 bg-gray-50">
          {databaseData?.databases?.map((db: { name: number | bigint | boolean | SetStateAction<string> | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<AwaitedReactNode> | null | undefined; schemas: string | any[]; }, index: Key | null | undefined) => (
            <div 
              key={index}
              className={`flex items-center p-2 rounded cursor-pointer ${
                selectedDatabase === db.name ? 'bg-emerald-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedDatabase(db.name);
                if (db.schemas?.length > 0) {
                  setSelectedSchema(db.schemas[0].name);
                }
                setSelectedTable(null);
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 mr-2 bg-emerald-100 rounded">
                <Database size={18} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium">{db.name}</span>
            </div>
          ))}
        </div>
        
        {/* Schema selector */}
        <div className="p-4">
          {currentDatabase.schemas?.map((schema: { name: number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<AwaitedReactNode> | SetStateAction<string> | null | undefined; }, index: Key | null | undefined) => (
            <div 
              key={index}
              className={`flex items-center p-2 rounded cursor-pointer ${
                selectedSchema === schema.name ? 'bg-emerald-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedSchema(schema.name);
                setSelectedTable(null);
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-100 rounded">
                <span className="text-gray-600 text-sm">📋</span>
              </div>
              <span className="text-sm font-medium">{schema.name}</span>
              {selectedSchema === schema.name && (
                <span className="ml-auto text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {/* Search bar and stats */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600">
            {totalTables} tables, {totalRecords} total records
          </div>
          <button
            onClick={onRefresh}
            className="text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 px-4 rounded-md flex items-center"
          >
            <Database size={16} className="mr-1" />
            Refresh
          </button>
        </div>
        
        {/* Tables list */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Columns</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rows</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTables && filteredTables.length > 0 ? (
                filteredTables.map((table: SetStateAction<null>, index: Key | null | undefined) => {
                  if (!table) return null;
                  return (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTable(table)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">{table.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.type || 'Table'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.columns?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.rows || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{table.description || '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'No tables match your search criteria' : 'No tables found in this schema'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table structure */}
        {selectedTable && (
          <div className="mt-4 px-6 pb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              {selectedTable.name} Structure
            </h2>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nullable</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedTable.columns && selectedTable.columns.length > 0 ? (
                    selectedTable.columns.map((column: { name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; type: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; nullable: any; }, index: Key | null | undefined) => (
                      <tr key={index}>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{column.name}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{column.type}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                          {column.nullable ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No columns found for this table
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}