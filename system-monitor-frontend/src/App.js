import React from "react";
import { Server } from "lucide-react";
import useWebSocket from "./hooks/useWebSocket";
import LoadingState from "./components/LoadingState";
import Header from "./components/Header";
import CpuCard from "./components/CpuCard";
import MemoryCard from "./components/MemoryCard";
import DiskCard from "./components/DiskCard";
import TemperatureCard from "./components/TemperatureCard";
import SystemInfoCard from "./components/SystemInfoCard";
import NetworkCard from "./components/NetworkCard";
import LoadAverageCard from "./components/LoadAverageCard";

const SystemMonitor = () => {
  const { systemData, connected } = useWebSocket(`ws://${window.location.hostname}:5001`);

  if (!connected) {
    return (
      <LoadingState
        title="Connecting to Server..."
        subtitle="Make sure the WebSocket server is running on port 8080"
        icon={Server}
      />
    );
  }

  if (!systemData) {
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
        {/* Header */}
        <Header
          hostname={systemData.hostname}
          platform={systemData.platform}
          arch={systemData.arch}
          connected={connected}
        />

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <CpuCard cpuData={systemData.cpu} />
          <MemoryCard memoryData={systemData.memory} />
          <DiskCard diskData={systemData.disk} />
          <TemperatureCard temperatureData={systemData.temperature} />
        </div>

        {/* Detailed Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <SystemInfoCard systemData={systemData} />
          <NetworkCard
            networkData={systemData.network}
            uptimeData={systemData.uptime}
          />
          <LoadAverageCard
            loadavgData={systemData.loadavg}
            dockerData={systemData.docker}
            timestamp={systemData.timestamp}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
