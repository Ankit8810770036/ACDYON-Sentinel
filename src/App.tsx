import React, { useState, useEffect, useRef } from 'react';
import { Header, ActiveTabType } from './components/Header';
import { PipelineControls } from './components/PipelineControls';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { LogViewer } from './components/LogViewer';
import { IngestedJobsTable } from './components/IngestedJobsTable';
import { DesignDocViewer } from './components/DesignDocViewer';
import { DecisionsViewer } from './components/DecisionsViewer';
import { IngestionConfig, EngineStats, LogEntry, RequestMetric, JobListing } from './types/ingestion';
import { IngestionPipeline } from './engine/ingestionPipeline';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('telemetry');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [config, setConfig] = useState<IngestionConfig>({
    source: 'SANDBOX_SIMULATOR',
    concurrency: 1,
    minDelayMs: 1200,
    maxDelayMs: 2500,
    jitterEnabled: true,
    circuitBreakerEnabled: true,
    identityRotationEnabled: true,
    fallbackParserEnabled: true,
    sandboxRateLimitThreshold: 2,
    sandboxBotCheckStrictness: 'MEDIUM',
    sandboxDomDriftProbability: 0.3,
    sandboxErrorRate: 0.1,
  });

  const [stats, setStats] = useState<EngineStats>({
    totalRequests: 0,
    successCount: 0,
    rateLimitedCount: 0,
    blockedCount: 0,
    serverErrorCount: 0,
    totalJobsIngested: 0,
    validSchemaCount: 0,
    fallbackRecoveredCount: 0,
    avgLatencyMs: 0,
    circuitState: 'CLOSED',
    activeUserAgentPoolSize: 4,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<RequestMetric[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);

  const pipelineRef = useRef<IngestionPipeline | null>(null);

  useEffect(() => {
    // Initialize Pipeline
    pipelineRef.current = new IngestionPipeline(
      config,
      (newStats, newLogs, newMetrics, newJobs) => {
        setStats(newStats);
        setLogs(newLogs);
        setMetrics(newMetrics);
        setJobs(newJobs);
        if (pipelineRef.current) {
          setIsRunning(pipelineRef.current.isPipelineRunning());
        }
      }
    );

    return () => {
      if (pipelineRef.current) {
        pipelineRef.current.stop();
      }
    };
  }, []);

  const handleConfigChange = (newConfig: IngestionConfig) => {
    setConfig(newConfig);
    if (pipelineRef.current) {
      pipelineRef.current.updateConfig(newConfig);
    }
  };

  const handleTogglePipeline = () => {
    if (!pipelineRef.current) return;
    if (isRunning) {
      pipelineRef.current.stop();
      setIsRunning(false);
    } else {
      pipelineRef.current.start();
      setIsRunning(true);
    }
  };

  const handleClearData = () => {
    if (pipelineRef.current) {
      pipelineRef.current.clearData();
    }
  };

  const handleTriggerSingle = () => {
    if (pipelineRef.current) {
      pipelineRef.current.executeSingleRequest();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-midnight text-frost flex flex-col font-sans selection:bg-electric selection:text-white">
      {/* Top Fixed Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRunning={isRunning}
        onTogglePipeline={handleTogglePipeline}
        circuitState={stats.circuitState}
        activeSource={config.source}
        totalJobs={jobs.length}
      />

      {/* Main Viewport Workspace - Non-Scrollable Page Level */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 overflow-y-auto min-h-0">
        {activeTab === 'telemetry' && (
          <div className="space-y-6 animate-fadeIn pb-4">
            <TelemetryDashboard stats={stats} metrics={metrics} />
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="animate-fadeIn pb-4">
            <PipelineControls
              config={config}
              onChangeConfig={handleConfigChange}
              onClearData={handleClearData}
              onTriggerSingle={handleTriggerSingle}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-fadeIn h-full flex flex-col min-h-0">
            <LogViewer logs={logs} onClearLogs={handleClearData} />
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="animate-fadeIn h-full flex flex-col min-h-0">
            <IngestedJobsTable jobs={jobs} />
          </div>
        )}

        {activeTab === 'design' && (
          <div className="animate-fadeIn pb-4">
            <DesignDocViewer />
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="animate-fadeIn pb-4">
            <DecisionsViewer />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
