import React, { ReactNode } from "react";
import { X, Info } from "lucide-react";

interface SavedConnection {
  type: ReactNode;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;

  source_name?: string;
  isConnected: boolean;
}

interface ConnectionForm {
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;

  source_name?: string;
}
interface SourceConnectionModalProps {
  selectedDatabase: string | null;
  savedConnection: SavedConnection | null;
  connectionForm: ConnectionForm;
  onInputChange: (field: string, value: string) => void;
  onTest: () => void;
  onSave: () => void;
  onClose: () => void;
}

const SourceConnectionModal: React.FC<SourceConnectionModalProps> = ({
  selectedDatabase,
  savedConnection,
  connectionForm,
  onInputChange,
  onTest,
  onSave,
  onClose,
}) => {
  const databaseOptions = [
    {
      name: "PostgreSQL",
      icon: "🐘",
      description: "Powerful, open source object-relational database",
    },
    {
      name: "MySQL",
      icon: "🐬",
      description: "Popular open source relational database",
    },
    {
      name: "SQL Server",
      icon: "🪟",
      description: "Microsoft's enterprise relational database",
    },
    { name: "MongoDB", icon: "🍃", description: "NoSQL document database" },
    { name: "Oracle", icon: "☁️", description: "Enterprise database solution" },
    {
      name: "SQLite",
      icon: "🔹",
      description: "Lightweight disk-based database",
    },
    {
      name: "MariaDB",
      icon: "🐋",
      description: "Community-developed fork of MySQL",
    },
    {
      name: "Redis",
      icon: "⚡",
      description: "In-memory data structure store",
    },
  ];

  const selectedDatabaseInfo = databaseOptions.find(
    (db) => db.name === selectedDatabase
  );

  const validateForm = () => {
    const requiredFields = ["name", "host", "port", "username", "database"];
    return requiredFields.every((field) =>
      connectionForm[field as keyof ConnectionForm]?.trim()
    );
  };

  return (
    <div className="w-96 border-l border-gray-300 bg-gray-100 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-white border-b border-gray-300">
        <h3 className="font-medium">Properties</h3>
        <button className="text-gray-400 hover:text-gray-700" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {selectedDatabase && (
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-6">
            <div className="text-4xl mb-4 text-bold text-center">
              {selectedDatabaseInfo?.icon}
            </div>
            <h2 className="text-xl font-bold text-black text-center mb-2">
              {selectedDatabase}
            </h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              {selectedDatabaseInfo?.description}
            </p>

            {savedConnection ? (
              <div className="border-t border-gray-300 py-4 my-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-teal-800">
                    {savedConnection.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      savedConnection.isConnected
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {savedConnection.isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Host:</span>
                    <span className="font-medium text-black">
                      {savedConnection.host}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Port:</span>
                    <span className="font-medium text-black">
                      {savedConnection.port}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-medium text-black">
                      {savedConnection.username}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Password:</span>
                    <span className="font-medium text-black">••••••••</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Database:</span>
                    <span className="font-medium text-black">
                      {savedConnection.database}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-black">{savedConnection.type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-300 py-4 my-4">
                <h3 className="text-sm text-black font-medium mb-2 flex items-center">
                  <Info size={16} className="mr-2 text-teal-700" />
                  Connection Details
                </h3>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Connection Name*
                    </label>
                    <input
                      type="text"
                      className="w-full border text-black border-gray-300 rounded p-2 text-sm"
                      value={connectionForm.name}
                      onChange={(e) => onInputChange("name", e.target.value)}
                      placeholder="My Database Connection"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Host*
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 text-black rounded p-2 text-sm"
                      value={connectionForm.host}
                      onChange={(e) => onInputChange("host", e.target.value)}
                      placeholder="localhost or 127.0.0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Port*
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 text-black rounded p-2 text-sm"
                      value={connectionForm.port}
                      onChange={(e) => onInputChange("port", e.target.value)}
                      placeholder="Default port for selected database"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Username*
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 text-black rounded p-2 text-sm"
                      value={connectionForm.username}
                      onChange={(e) =>
                        onInputChange("username", e.target.value)
                      }
                      placeholder="Database username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 text-black rounded p-2 text-sm"
                      value={connectionForm.password}
                      onChange={(e) =>
                        onInputChange("password", e.target.value)
                      }
                      placeholder="Database password"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Database Name*
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 text-black rounded p-2 text-sm"
                      value={connectionForm.database}
                      onChange={(e) =>
                        onInputChange("database", e.target.value)
                      }
                      placeholder="Name of the database to connect to"
                      required
                    />
                  </div>

                  {/* <div>
                    <label className="block text-xs text-gray-500 mb-1">Connection Type</label>
                    <select
                      className="w-full border border-gray-300 text-black rounded p-2 text-sm"
                      value={connectionForm.type}
                      onChange={(e) => onInputChange('type', e.target.value)}
                    >
                      <option value="Standard Connection">Standard Connection</option>
                      <option value="SSL Connection">SSL Connection</option>
                      <option value="SSH Tunnel">SSH Tunnel</option>
                    </select>
                  </div> */}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    className="border bg-white text-black border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
                    onClick={onTest}
                  >
                    Test Connection
                  </button>
                  <button
                    className="bg-teal-700 text-white px-4 py-2 rounded text-sm hover:bg-teal-800 disabled:opacity-50"
                    onClick={onSave}
                    disabled={!validateForm()}
                  >
                    Save Connection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceConnectionModal;
