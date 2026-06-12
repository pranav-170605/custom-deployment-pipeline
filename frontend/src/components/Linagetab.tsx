import React, { useState, useEffect } from 'react';

interface LineageTabProps {
  databaseType: string;
  connectionString: string;
  workspaceId: string;
  selectedDatabase: string;
  selectedSchema: string;
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;
  databaseData: any;
}

const LineageTab: React.FC<LineageTabProps> = ({
  workspaceId,
  selectedDatabase,
  selectedSchema,
  selectedTable,
  setSelectedTable,
  databaseData
}) => {
  const [lineageData, setLineageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [currentTable, setCurrentTable] = useState<string>(selectedTable || '');
  const [lineageType, setLineageType] = useState<'upstream' | 'downstream' | 'both'>('both');

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
      else if (tables.length > 0 && !currentTable) {
        setCurrentTable(tables[0]);
      }
    }
  }, [databaseData, selectedSchema, selectedTable, currentTable]);

  // Fetch lineage data when table or type changes
  useEffect(() => {
    const fetchLineageData = async () => {
      if (!currentTable) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/workspace/${workspaceId}/lineage?` + new URLSearchParams({
            database: selectedDatabase,
            schema: selectedSchema,
            table: currentTable,
            type: lineageType
          })
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch lineage data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLineageData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };
    
    if (currentTable) {
      fetchLineageData();
    }
  }, [workspaceId, selectedDatabase, selectedSchema, currentTable, lineageType]);

  const renderLineageNode = (node: any, depth: number = 0, nodeType: 'upstream' | 'downstream' | 'current' = 'current') => {
    if (!node) return null;
    
    let nodeColorClass;
    switch (nodeType) {
      case 'upstream':
        nodeColorClass = 'bg-teal-50 border-teal-200';
        break;
      case 'downstream':
        nodeColorClass = 'bg-blue-50 border-blue-200';
        break;
      default:
        nodeColorClass = 'bg-purple-50 border-purple-200';
    }
    
    return (
      <div 
        key={`${node.schema}.${node.name}`}
        className={`rounded-lg p-4 border shadow-sm ${nodeColorClass} mb-2`}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">{node.name}</h4>
            <div className="text-sm text-gray-600">{node.schema}</div>
          </div>
          {node.type && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
              {node.type}
            </span>
          )}
        </div>
        
        {node.description && (
          <p className="text-sm text-gray-600 mt-2">{node.description}</p>
        )}
        
        {node.columns && node.columns.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-gray-500 mb-1">KEY COLUMNS:</div>
            <div className="text-sm">
              {node.columns.map((col: string, idx: number) => (
                <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-white rounded border border-gray-200">
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Render related nodes recursively */}
        {nodeType === 'upstream' && node.dependencies?.map((dep: any, idx: number) => 
          renderLineageNode(dep, depth + 1, 'upstream')
        )}
        
        {nodeType === 'downstream' && node.dependents?.map((dep: any, idx: number) => 
          renderLineageNode(dep, depth + 1, 'downstream')
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className="font-medium mr-4">Data Lineage</h3>
          <select 
            className="border border-gray-300 rounded-md p-1 px-2 mr-3"
            value={currentTable}
            onChange={(e) => {
              setCurrentTable(e.target.value);
              setSelectedTable(e.target.value);
            }}
          >
            {tableOptions.map(table => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
          
          <div className="ml-4 flex items-center">
            <div className="mr-3 text-gray-700">View:</div>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1 text-sm ${lineageType === 'upstream' ? 'bg-teal-500 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setLineageType('upstream')}
              >
                Upstream
              </button>
              <button 
                className={`px-3 py-1 text-sm border-l border-r border-gray-300 ${lineageType === 'both' ? 'bg-teal-500 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setLineageType('both')}
              >
                Both
              </button>
              <button 
                className={`px-3 py-1 text-sm ${lineageType === 'downstream' ? 'bg-teal-500 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setLineageType('downstream')}
              >
                Downstream
              </button>
            </div>
          </div>
        </div>
        
        <button 
          className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          onClick={() => {
            setLineageData(null);
            // Trigger a refetch
            setLineageType(lineageType);
          }}
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          <span className="ml-2 text-gray-600">Loading lineage data...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <h4 className="font-medium mb-1">Error Loading Lineage</h4>
            <p>{error}</p>
          </div>
        </div>
      ) : !lineageData ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-gray-500">
            <p>Select a table to view its lineage.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Current table */}
          <div className="mb-6">
            <h4 className="text-gray-500 text-sm font-medium mb-2">CURRENT TABLE</h4>
            {renderLineageNode(lineageData.current, 0, 'current')}
          </div>
          
          {/* Upstream lineage */}
          {(lineageType === 'upstream' || lineageType === 'both') && lineageData.upstream && lineageData.upstream.length > 0 && (
            <div className="mb-6">
              <h4 className="text-gray-500 text-sm font-medium mb-2">UPSTREAM DEPENDENCIES (DATA SOURCES)</h4>
              <div className="space-y-2">
                {lineageData.upstream.map((node: any, idx: number) => 
                  renderLineageNode(node, 0, 'upstream')
                )}
              </div>
            </div>
          )}
          
          {/* Downstream lineage */}
          {(lineageType === 'downstream' || lineageType === 'both') && lineageData.downstream && lineageData.downstream.length > 0 && (
            <div>
              <h4 className="text-gray-500 text-sm font-medium mb-2">DOWNSTREAM DEPENDENTS (DATA CONSUMERS)</h4>
              <div className="space-y-2">
                {lineageData.downstream.map((node: any, idx: number) => 
                  renderLineageNode(node, 0, 'downstream')
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LineageTab;