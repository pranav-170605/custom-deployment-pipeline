"use client";
import React, { useState, useEffect } from "react";
import { Database, Check, MoreVertical, Plus } from "lucide-react";
import MetadataIngestionForm from "../../components/InjestionConfig";
import ScheduleIngestionForm from "../../components/ScheduleIngestionForm";
import { DatabaseView } from "../../components/Databaseview";
import DatabaseViewTabs from "../../components/DatabaseviewTabs";
import {
  useConfigureIngestion,
  useScheduleIngestion,
  IngestionService,
  SchedulePayload,
} from "../../hooks/useInjestion";
import MetadataFetcherCard from "@/components/MetadataCard";

interface ScheduleIngestionFormProps {
  onBack: () => void;
  onDeploy: (scheduleData: SchedulePayload) => void;
}

interface IngestionProps {
  showPostgreSQLView: boolean;
  showDatabaseView: boolean;
  showScheduleForm: boolean;
  showMetadataForm: boolean;
  handleNext: () => void;
  handleScheduleBack: () => void;
  handleDeploy: () => void;
  handleMetadataNext: () => void;
  setShowMetadataForm: (show: boolean) => void;
  currentStep: "configure" | "schedule";
  configureCompleted: boolean;
}

export const Ingestion: React.FC<IngestionProps> = ({
  showPostgreSQLView,
  showDatabaseView,
  showScheduleForm,
  showMetadataForm,
  handleNext,
  handleScheduleBack,
  handleDeploy,
  handleMetadataNext,
  setShowMetadataForm,
  currentStep,
  configureCompleted,
}) => {
  console.log("🔄 Rendering Ingestion component with state:", {
    showPostgreSQLView,
    showDatabaseView,
    showScheduleForm,
    showMetadataForm,
    currentStep,
    configureCompleted,
  });

  const [showIngestionDropdown, setShowIngestionDropdown] = useState(false);
  const { mutate: scheduleIngestion } = useScheduleIngestion();

  useEffect(() => {
    console.log("👉 Current step:", currentStep);
    console.log("✅ Configure completed:", configureCompleted);
  }, [currentStep, configureCompleted]);

  const ingestionOptions = [
    "Add metadata ingestion",
    "Add lineage ingestion",
    "Add profiler ingestion",
    "Add Auto Classification ingestion",
    "Add dbt ingestion",
  ];

  const handleAddIngestion = (option: string) => {
    console.log("📝 Adding new ingestion:", option);
    setShowIngestionDropdown(false);
    if (option === "Add metadata ingestion") {
      console.log("🔄 Opening metadata ingestion form");
      setShowMetadataForm(true);
    }
  };

  const handleDeployWithSchedule = (scheduleData: SchedulePayload) => {
    console.log("📤 Scheduling ingestion with data:", scheduleData);
    scheduleIngestion(scheduleData, {
      onSuccess: (data) => {
        console.log("✅ Ingestion scheduled successfully:", data);
        handleDeploy();
      },
      onError: (error) => {
        console.error("❌ Error scheduling ingestion:", error);
      },
    });
  };

  // If view-specific content needs to be rendered
  if (showPostgreSQLView) {
    return (
      <DatabaseViewTabs
        databaseType="PostgreSQL"
        connectionString="localhost:5432"
        workspaceId="1"
      />
    );
  } else if (showDatabaseView) {
    return (
      <div className="">
        <MetadataFetcherCard />
        <div className="absolute bottom-6 right-6 m-4 mb-8">
          <button
            onClick={handleNext}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Next
          </button>
        </div>
      </div>
    );
  } else if (showScheduleForm) {
    return (
      <ScheduleIngestionForm
        onBack={handleScheduleBack}
        onDeploy={handleDeployWithSchedule}
      />
    );
  } else if (showMetadataForm) {
    return (
      <MetadataIngestionForm
        onNext={handleMetadataNext}
        onCancel={() => setShowMetadataForm(false)}
        currentStep={currentStep}
        configureCompleted={configureCompleted}
      />
    );
  } else {
    return (
      <>
        {/* Add Ingestion Button */}
        <div className="flex justify-end items-center mb-6">
          <div className="relative">
            <button
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              onClick={() => setShowIngestionDropdown(!showIngestionDropdown)}
            >
              <Plus size={16} className="mr-2" />
              Add Ingestion
            </button>
            {showIngestionDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border">
                {ingestionOptions.map((option, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                    onClick={() => handleAddIngestion(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services table */}
        <div className="flex flex-col items-center justify-center py-16 bg-white">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Database size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No ingestion services configured
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
            Create your first ingestion service by clicking the "Add Ingestion"
            button above
          </p>
        </div>
      </>
    );
  }
};
