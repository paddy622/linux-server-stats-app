import React from "react";
import { Server } from "lucide-react";
import useWebSocket from "./hooks/useWebSocket";
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
  const { systemData, staticData, dynamicData, connected, reconnecting, isInitialLoad } = useWebSocket(`ws://${window.location.hostname}:5001`);

  // Show loading only for initial connection or when there's no static data at all
  if (!connected && !staticData) {
    return (
      <LoadingState
        title="Connecting to Server..."
        subtitle="Make sure the WebSocket server is running on port 8080"
        icon={Server}
      />
    );
  }

  // Show loading only if we have no static data (first time loading)
  if (isInitialLoad && !staticData) {
    return (
      <LoadingState
        title="Loading System Data..."
        subtitle="Gathering server metrics..."
      />
    );
  }

  // Add safety check for dynamic data
  if (!dynamicData || !systemData) {
    return (
      <LoadingState
        title="Loading System Data..."
        subtitle="Gathering server metrics..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
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
      </div>
    </div>
  );
};

export default SystemMonitor;
