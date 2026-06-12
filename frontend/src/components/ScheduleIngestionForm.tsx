
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  SchedulePayload,
  useScheduleIngestion,
  useRunIngestionJob,
} from "../hooks/useInjestion";

interface ScheduleIngestionFormProps {
  onBack: () => void;
  onDeploy: (scheduleData: SchedulePayload) => void;
}

const ScheduleIngestionForm: React.FC<ScheduleIngestionFormProps> = ({
  onBack,
  onDeploy,
}) => {
  const router = useRouter();
  const { ingestionId } = useUser();
  const [scheduleType, setScheduleType] = useState<"schedule" | "on-demand">(
    "schedule"
  );
  const [frequency, setFrequency] = useState("Hour");
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [retries, setRetries] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get mutation functions
  const scheduleMutation = useScheduleIngestion();
  const runIngestionMutation = useRunIngestionJob();

  const handleDeploy = async () => {
    if (!ingestionId) {
      console.error("❌ No ingestion ID found in context");
      alert("Error: Ingestion ID is missing. Please try again.");
      return;
    }

    setIsSubmitting(true);

    const scheduleData: SchedulePayload = {
      schedule_type: scheduleType,
      frequency,
      hour,
      minute,
      retries,
    };

    console.log(
      "📤 Preparing to deploy ingestion with schedule data:",
      scheduleData
    );
    console.log("🔑 Using ingestion ID:", ingestionId);

    try {
      // First API call: Schedule the ingestion
      const scheduleResult = await scheduleMutation.mutateAsync(scheduleData);
      console.log("✅ Scheduling successful:", scheduleResult);

      // Second API call: Run the ingestion job
      const runResult = await runIngestionMutation.mutateAsync();
      console.log("✅ Ingestion job started:", runResult);

      // Call the parent's onDeploy function
      onDeploy(scheduleData);
    } catch (error) {
      console.error("❌ Error during deployment:", error);
      alert("An error occurred while deploying the ingestion job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            {/* Configure Step (Completed) */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                ✓
              </div>
              <span className="ml-2 text-teal-600 font-medium">
                Configure Ingestion
              </span>
            </div>
            {/* Line between steps */}
            <div className="flex-1 h-0.5 mx-4 bg-teal-600"></div>
            {/* Schedule Step (Current) */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full border-2 border-teal-600 flex items-center justify-center text-teal-600 font-medium">
                2
              </div>
              <span className="ml-2 text-teal-600 font-medium">
                Schedule Ingestion
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg p-6">
        <div className="space-y-6">
          {/* Schedule Type */}
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Schedule Option */}
              <div
                className={`border rounded-lg p-4 text-black cursor-pointer transition-all ${
                  scheduleType === "schedule"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200"
                }`}
                onClick={() => setScheduleType("schedule")}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    className="form-radio text-teal-700 h-4 w-4"
                    name="scheduleType"
                    value="schedule"
                    checked={scheduleType === "schedule"}
                    onChange={(e) =>
                      setScheduleType(e.target.value as "schedule")
                    }
                  />
                  <span className="ml-2 font-medium">Schedule</span>
                </div>
                <p className="text-sm text-gray-500 ml-6">
                  Schedule the ingestion to run at a specific time and frequency
                </p>
              </div>

              {/* On-Demand Option */}
              <div
                className={`border rounded-lg p-4 text-black cursor-pointer transition-all ${
                  scheduleType === "on-demand"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200"
                }`}
                onClick={() => setScheduleType("on-demand")}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    className="form-radio text-teal-600 h-4 w-4"
                    name="scheduleType"
                    value="on-demand"
                    checked={scheduleType === "on-demand"}
                    onChange={(e) =>
                      setScheduleType(e.target.value as "on-demand")
                    }
                  />
                  <span className="ml-2 font-medium">On-Demand</span>
                </div>
                <p className="text-sm text-gray-500 ml-6">
                  Run the ingestion manually
                </p>
              </div>
            </div>

            {scheduleType === "schedule" && (
              <>
                {/* Frequency */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Every:
                  </label>
                  <div className="w-48">
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-teal-500 text-black bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-00"
                    >
                      <option>Hour</option>
                      <option>Day</option>
                      <option>Week</option>
                      <option>Month</option>
                    </select>
                  </div>
                </div>

                {/* Time Selection */}
                <div className="flex space-x-6 mb-6">
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hour:
                    </label>
                    <select
                      value={hour}
                      onChange={(e) => setHour(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-teal-500 text-black bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-00"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minute:
                    </label>
                    <select
                      value={minute}
                      onChange={(e) => setMinute(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-teal-500 text-black bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-00"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Number of Retries */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. of Retries:
              </label>
              <input
                type="number"
                value={retries}
                onChange={(e) => setRetries(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm text-black border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Ingestion ID info */}
        {ingestionId && (
          <div className="mt-6 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Ingestion ID: {ingestionId}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
          <button
            onClick={handleDeploy}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Add & Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleIngestionForm;