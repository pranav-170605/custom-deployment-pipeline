import React from 'react';
import { Ingestion } from '../page';

interface IngestionTabProps {
  showPostgreSQLView: boolean;
  showDatabaseView: boolean;
  showScheduleForm: boolean;
  showMetadataForm: boolean;
  handleNext: () => void;
  handleScheduleBack: () => void;
  handleDeploy: () => void;
  handleMetadataNext: () => void;
  setShowMetadataForm: (show: boolean) => void;
  currentStep: 'configure' | 'schedule';
  configureCompleted: boolean;
}

const IngestionTab: React.FC<IngestionTabProps> = ({
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
  return (
    <Ingestion 
      showPostgreSQLView={showPostgreSQLView}
      showDatabaseView={showDatabaseView}
      showScheduleForm={showScheduleForm}
      showMetadataForm={showMetadataForm}
      handleNext={handleNext}
      handleScheduleBack={handleScheduleBack}
      handleDeploy={handleDeploy}
      handleMetadataNext={handleMetadataNext}
      setShowMetadataForm={setShowMetadataForm}
      currentStep={currentStep}
      configureCompleted={configureCompleted}
    />
  );
};

export default IngestionTab; 