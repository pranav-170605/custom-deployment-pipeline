import React from 'react';

interface DatabaseDialogProps {
  selectedDatabase: string | null;
  onSelect: (dbName: string) => void;
  onClose: () => void;
}

const databaseOptions = [
  { name: 'PostgreSQL', icon: '🐘', description: 'Powerful, open source object-relational database' },
  { name: 'MySQL', icon: '🐬', description: 'Popular open source relational database' },
  { name: 'SQL Server', icon: '🪟', description: "Microsoft's enterprise relational database" },
  { name: 'MongoDB', icon: '🍃', description: 'NoSQL document database' },
  { name: 'Oracle', icon: '☁️', description: 'Enterprise database solution' },
  { name: 'SQLite', icon: '🔹', description: 'Lightweight disk-based database' },
  { name: 'MariaDB', icon: '🐋', description: 'Community-developed fork of MySQL' },
  { name: 'Redis', icon: '⚡', description: 'In-memory data structure store' }
];

const DatabaseDialog: React.FC<DatabaseDialogProps> = ({
  selectedDatabase,
  onSelect,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-[0.5px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-zinc-800">Select Database Type</h3>
          <button 
            className="text-zinc-500 hover:text-zinc-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {databaseOptions.map((db) => (
            <div
              key={db.name}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center ${
                selectedDatabase === db.name ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
              }`}
              onClick={() => {
                onSelect(db.name);
                onClose();
              }}
            >
              <div className="text-4xl mr-4">{db.icon}</div>
              <div>
                <h3 className="font-medium text-zinc-800">{db.name}</h3>
                <p className="text-sm text-zinc-500">{db.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatabaseDialog; 