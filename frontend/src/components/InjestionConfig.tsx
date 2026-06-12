import React, { useState, useEffect } from 'react';
import { useConfigureIngestion } from '../hooks/useInjestion';

interface MetadataIngestionFormProps {
  onCancel: () => void;
  onNext: () => void;
  currentStep: 'configure' | 'schedule';
  configureCompleted: boolean;
}

interface FormData {
  name: string;
  ingestion_type: string;
  database_filter_pattern: {
    includes: string;
    excludes: string;
  };
  schema_filter_pattern: {
    includes: string;
    excludes: string;
  };
  table_filter_pattern: {
    includes: string;
    excludes: string;
  };
  enable_debug_log: boolean;
  mark_deleted_tables: boolean;
}

const MetadataIngestionForm: React.FC<MetadataIngestionFormProps> = ({
  onNext,
  onCancel,
  currentStep,
  configureCompleted
}) => {
  console.log('🔄 Rendering MetadataIngestionForm with state:', {
    currentStep,
    configureCompleted
  });

  const { mutate: configureIngestion, isPending, isError, error } = useConfigureIngestion();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ingestion_type: 'metadata',
    database_filter_pattern: {
      includes: '',
      excludes: ''
    },
    schema_filter_pattern: {
      includes: '',
      excludes: ''
    },
    table_filter_pattern: {
      includes: '',
      excludes: ''
    },
    enable_debug_log: false,
    mark_deleted_tables: false
  });

  useEffect(() => {
    console.log('📝 Current form data:', formData);
  }, [formData]);

  const handleInputChange = (section: 'database_filter_pattern' | 'schema_filter_pattern' | 'table_filter_pattern', field: 'includes' | 'excludes', value: string) => {
    console.log(`🔄 Updating ${section}.${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNameChange = (value: string) => {
    console.log('🔄 Updating name to:', value);
    setFormData(prev => ({
      ...prev,
      name: value
    }));
  };

  const handleCheckboxChange = (field: keyof Pick<FormData, 'enable_debug_log' | 'mark_deleted_tables'>) => {
    console.log(`🔄 Toggling ${field}`);
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = () => {
    console.log('📤 Submitting form data:', formData);
    configureIngestion(formData, {
      onSuccess: (data) => {
        console.log('✅ Ingestion configured successfully:', data);
        onNext();
      },
      onError: (error) => {
        console.error('❌ Error configuring ingestion:', error);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-medium">
            1
          </div>
          <span className="ml-2 text-teal-600 font-medium">Configure Ingestion</span>
        </div>
        <div className="mx-4 flex-1 border-t border-gray-300"></div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
            2
          </div>
          <span className="ml-2 text-gray-500 font-medium">Schedule Ingestion</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        {/* Database Filter Pattern */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Database Filter Pattern</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Includes</label>
              <input
                type="text"
                className="w-full border border-gray-300 text-black  rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter database pattern to include"
                value={formData.database_filter_pattern.includes}
                onChange={(e) => handleInputChange('database_filter_pattern', 'includes', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Excludes</label>
              <input
                type="text"
                className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter database pattern to exclude"
                value={formData.database_filter_pattern.excludes}
                onChange={(e) => handleInputChange('database_filter_pattern', 'excludes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Schema Filter Pattern */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Schema Filter Pattern</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Includes</label>
              <input
                type="text"
                className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter schema pattern to include"
                value={formData.schema_filter_pattern.includes}
                onChange={(e) => handleInputChange('schema_filter_pattern', 'includes', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Excludes</label>
              <input
                type="text"
                className="w-full border border-gray-300  text-black rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter schema pattern to exclude"
                value={formData.schema_filter_pattern.excludes}
                onChange={(e) => handleInputChange('schema_filter_pattern', 'excludes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Filter Pattern */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Table Filter Pattern</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Includes</label>
              <input
                type="text"
                className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter table pattern to include"
                value={formData.table_filter_pattern.includes}
                onChange={(e) => handleInputChange('table_filter_pattern', 'includes', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Excludes</label>
              <input
                type="text"
                className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter table pattern to exclude"
                value={formData.table_filter_pattern.excludes}
                onChange={(e) => handleInputChange('table_filter_pattern', 'excludes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Options</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                checked={formData.enable_debug_log}
                onChange={() => handleCheckboxChange('enable_debug_log')}
              />
              <span className="ml-2 text-sm text-gray-600">Enable Debug Log</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                checked={formData.mark_deleted_tables}
                onChange={() => handleCheckboxChange('mark_deleted_tables')}
              />
              <span className="ml-2 text-sm text-gray-600">Mark Deleted Tables</span>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
            isPending ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {isPending ? 'Configuring...' : 'Next'}
        </button>
      </div>
      {isError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          Error: {error instanceof Error ? error.message : 'Failed to configure ingestion'}
        </div>
      )}
    </div>
  );
};

export default MetadataIngestionForm; 