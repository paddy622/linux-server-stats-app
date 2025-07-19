import React, { useMemo } from "react";
import { Server } from "lucide-react";
import useStaticData from "./hooks/useStaticData";
import useDynamicData from "./hooks/useDynamicData";
import LoadingState from "./components/LoadingState";
import Header from "./components/Header";
import CpuCard from "./components/CpuCard";
import MemoryCard from "./components/MemoryCard";
import DiskCard from "./components/DiskCard";
import TemperatureCard from "./components/TemperatureCard";
import StaticSystemInfo from "./components/StaticSystemInfo";
import NetworkCard from "./components/NetworkCard";
import LoadAverageCard from "./components/LoadAverageCard";

const SystemMonitor = () => {
  // Configuration
  const serverHost = window.location.hostname;
  const serverPort = 5001; // Updated to match the new server port
  const baseUrl = `http://${serverHost}:${serverPort}`;
  const wsUrl = `ws://${serverHost}:${serverPort}`;

  // Independent data fetching
  const {
    staticData,
    loading: staticDataLoading,
    error: staticDataError,
    refetch: refetchStaticData
  } = useStaticData(baseUrl);

  const {
    dynamicData,
    connected,
    reconnecting,
    sendMessage
  } = useDynamicData(wsUrl);

  // Combine static and dynamic data for backward compatibility
  const systemData = useMemo(() => {
    if (!staticData || !dynamicData) return null;

    return {
      ...staticData,
      ...dynamicData,
      cpu: {
        ...staticData.cpu,
        ...dynamicData.cpu
      }
    };
  }, [staticData, dynamicData]);

  // Show loading only if static data is still loading or there's a critical error
  if (staticDataLoading) {
    return (
      <LoadingState
        title="Loading System Information..."
        subtitle="Fetching server configuration and static data..."
        icon={Server}
      />
    );
  }

  // Show error if static data failed to load
  if (staticDataError) {
    return (
      <LoadingState
        title="Connection Failed"
        subtitle={`Failed to load system data: ${staticDataError}`}
        icon={Server}
      />
    );
  }

  // Show static data immediately, dynamic cards will show loading individually
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Development info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
            <div>Static Data: {staticData ? '✅ Loaded' : '❌ Missing'}</div>
            <div>Dynamic Data: {dynamicData ? '✅ Connected' : '❌ Waiting'}</div>
            <div>WebSocket: {connected ? '🟢 Connected' : reconnecting ? '🟡 Reconnecting' : '🔴 Disconnected'}</div>
            <div>Server: {baseUrl} | WS: {wsUrl}</div>
          </div>
        )}

        {/* Header - Shows static data and connection status */}
        <Header
          hostname={staticData?.hostname}
          platform={staticData?.platform}
          arch={staticData?.arch}
          connected={connected}
          reconnecting={reconnecting}
        />

        {/* Main Metrics Cards - Dynamic data with live indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <CpuCard
            cpuData={systemData?.cpu}
            timestamp={dynamicData?.timestamp}
          />
          <MemoryCard
            memoryData={dynamicData?.memory}
            timestamp={dynamicData?.timestamp}
          />
          <DiskCard
            diskData={dynamicData?.disk}
            timestamp={dynamicData?.timestamp}
          />
          <TemperatureCard
            temperatureData={dynamicData?.temperature}
            timestamp={dynamicData?.timestamp}
          />
        </div>

        {/* Detailed Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Static System Information */}
          <StaticSystemInfo
            staticData={staticData}
            batteryData={dynamicData?.battery}
          />

          {/* Dynamic Network & Uptime Information */}
          <NetworkCard
            networkData={dynamicData?.network}
            uptimeData={dynamicData?.uptime}
            timestamp={dynamicData?.timestamp}
          />

          {/* Dynamic Load Average & Container Information */}
          <LoadAverageCard
            loadavgData={dynamicData?.loadavg}
            dockerData={dynamicData?.docker}
            timestamp={dynamicData?.timestamp}
          />
        </div>

        {/* Debug controls in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <div className="text-sm font-medium mb-2">Debug Controls:</div>
            <div className="space-x-2">
              <button
                onClick={refetchStaticData}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Refetch Static Data
              </button>
              <button
                onClick={() => sendMessage({ type: 'ping' })}
                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                disabled={!connected}
              >
                Ping WebSocket
              </button>
              <button
                onClick={() => sendMessage({ type: 'requestDynamic' })}
                className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                disabled={!connected}
              >
                Request Dynamic Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitor;
