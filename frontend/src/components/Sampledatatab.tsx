import React, { useState, useEffect } from 'react';

interface SampleDataTabProps {
  databaseType: string;
  connectionString: string;
  workspaceId: string;
  selectedDatabase: string;
  selectedSchema: string;
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;
  databaseData: any;
}

const SampleDataTab: React.FC<SampleDataTabProps> = ({
  databaseType,
  connectionString,
  workspaceId,
  selectedDatabase,
  selectedSchema,
  selectedTable,
  setSelectedTable,
  databaseData
}) => {
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [currentTable, setCurrentTable] = useState<string>('');
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(100);
  const [page, setPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [filter, setFilter] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Initialize tables and current table
  useEffect(() => {
    if (databaseData && databaseData.schemas && databaseData.schemas[selectedSchema]) {
      const tables = databaseData.schemas[selectedSchema].tables.map((t: any) => t.name);
      setTableOptions(tables);
      
      // If selectedTable is set and valid, use it
      if (selectedTable && tables.includes(selectedTable)) {
        setCurrentTable(selectedTable);
      } 
      // Otherwise use first table if available
      else if (tables.length > 0) {
        setCurrentTable(tables[0]);
      }
    }
  }, [databaseData, selectedSchema, selectedTable]);

  // Fetch sample data when table changes
  useEffect(() => {
    const fetchSampleData = async () => {
      if (!currentTable) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/workspace/${workspaceId}/data?` + new URLSearchParams({
            database: selectedDatabase,
            schema: selectedSchema,
            table: currentTable,
            limit: limit.toString(),
            page: page.toString(),
            filter: filter,
            sortColumn: sortColumn,
            sortDirection: sortDirection
          })
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sample data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSampleData(data.rows);
        setColumns(data.columns);
        setTotalRows(data.totalRows);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };
    
    fetchSampleData();
  }, [
    workspaceId, 
    selectedDatabase, 
    selectedSchema, 
    currentTable, 
    limit, 
    page, 
    filter, 
    sortColumn, 
    sortDirection
  ]);

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for a new column
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setPage(1); // Reset to first page on sort change
  };

  const renderSortIcon = (columnName: string) => {
    if (sortColumn !== columnName) {
      return '⇵';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className="font-medium mr-4">Sample Data</h3>
          <select 
            className="border border-gray-300 rounded-md p-1 px-2"
            value={currentTable}
            onChange={(e) => {
              setCurrentTable(e.target.value);
              setSelectedTable(e.target.value);
              setPage(1); // Reset to first page on table change
              setSortColumn('');
              setSortDirection('asc');
              setFilter('');
            }}
          >
            {tableOptions.map(table => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Filter data..."
            className="mr-2 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1); // Reset to first page when filter changes
            }}
          />
          
          <select
            className="border border-gray-300 rounded-md p-1 px-2 mr-2"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Reset to first page when limit changes
            }}
          >
            <option value={10}>10 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={500}>500 rows</option>
          </select>
          
          <button 
            className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            onClick={() => {
              setSampleData([]);
              setPage(1);
              // Trigger a refetch by updating a dependency
              setLimit(limit);
            }}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <h4 className="font-medium mb-1">Error Loading Data</h4>
            <p>{error}</p>
          </div>
        </div>
      ) : sampleData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-gray-500">
            <p>No data found{filter ? ' matching the filter criteria' : ''}.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((column, index) => (
                    <th 
                      key={index} 
                      className="text-left p-2 font-medium cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(column.name)}
                    >
                      <div className="flex items-center">
                        <span>{column.name}</span>
                        <span className="ml-1 text-gray-400">{renderSortIcon(column.name)}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-normal">{column.type}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="p-2">
                        {row[column.name] !== null && row[column.name] !== undefined 
                          ? String(row[column.name]) 
                          : <span className="text-gray-400">NULL</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalRows)} of {totalRows} rows
            </div>
            <div className="flex items-center">
              <button
                className={`mr-2 px-3 py-1 border border-gray-300 rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <div className="text-gray-600 mx-2">
                Page {page} of {Math.ceil(totalRows / limit)}
              </div>
              <button
                className={`px-3 py-1 border border-gray-300 rounded-md ${page >= Math.ceil(totalRows / limit) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                onClick={() => setPage(Math.min(Math.ceil(totalRows / limit), page + 1))}
                disabled={page >= Math.ceil(totalRows / limit)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SampleDataTab;