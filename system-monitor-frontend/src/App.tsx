import React, { useState } from "react";
import { Server } from "lucide-react";
import { StaticSystemInfo, DynamicSystemInfo } from "@linux-server-stats/shared-types";
import useStaticData from "./hooks/useStaticData";
import useDynamicData from "./hooks/useDynamicData";
import LoadingState from "./components/LoadingState";
import Header from "./components/Header";
import CpuCard from "./components/CpuCard";
import MemoryCard from "./components/MemoryCard";
import DiskCards from "./components/DiskCards";
import TemperatureCard from "./components/TemperatureCard";
import BatteryCard from "./components/BatteryCard";
import NetworkCard from "./components/NetworkCard";
import LoadAverageCard from "./components/LoadAverageCard";
import HorizontalAppCards from "./components/HorizontalAppCards";
import Accordion from "./components/Accordion";
import RefreshIntervalSelector from "./components/RefreshIntervalSelector";

const SystemMonitor: React.FC = () => {
    // Configuration
    const serverHost = window.location.hostname; // Use the current hostname
    const serverPort = 5001; // Updated to match the new server port
    const baseUrl = `http://${serverHost}:${serverPort}`;
    const wsUrl = `ws://${serverHost}:${serverPort}`;

    // Refresh interval state
    const [refreshInterval, setRefreshInterval] = useState<number>(5000); // Default 5 seconds
    const [isPaused, setIsPaused] = useState<boolean>(false);

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
    } = useDynamicData(wsUrl, isPaused ? null : refreshInterval);

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-3 sm:p-4 lg:p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header - Shows static data and connection status */}
                <Header
                    hostname={staticData?.hostname}
                    platform={staticData?.platform}
                    arch={staticData?.arch}
                    connected={connected}
                    reconnecting={reconnecting}
                    staticData={staticData}
                />

                {/* Hosted Applications */}
                <div className="mb-6 sm:mb-8">
                    <HorizontalAppCards
                        showAddButton={false}
                    />
                </div>

                {/* Refresh Interval Selector */}
                <div className="mb-6">
                    <RefreshIntervalSelector
                        interval={refreshInterval}
                        onIntervalChange={setRefreshInterval}
                        isPaused={isPaused}
                        onTogglePause={() => setIsPaused(!isPaused)}
                    />
                </div>

                {/* Main Metrics Cards - Dynamic data with live indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <CpuCard
                        cpuData={dynamicData?.cpu}
                        timestamp={dynamicData?.timestamp}
                        isPaused={isPaused}
                    />
                    <MemoryCard
                        memoryData={dynamicData?.memory}
                        timestamp={dynamicData?.timestamp}
                        isPaused={isPaused}
                    />
                    <TemperatureCard
                        temperatureData={dynamicData?.temperature}
                        timestamp={dynamicData?.timestamp}
                        isPaused={isPaused}
                    />
                    <BatteryCard
                        batteryData={dynamicData?.battery}
                        timestamp={dynamicData?.timestamp}
                        isPaused={isPaused}
                    />
                </div>

                {/* Disk Usage Section - Separate row for multiple disks */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <span className="text-blue-500 dark:text-blue-400 mr-2">💾</span>
                        Storage Devices
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        <DiskCards
                            diskData={dynamicData?.disk}
                            timestamp={dynamicData?.timestamp}
                            isPaused={isPaused}
                        />
                    </div>
                </div>

                {/* Detailed Information Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Dynamic Network & Uptime Information */}
                    <NetworkCard
                        networkData={dynamicData?.network}
                        uptimeData={dynamicData?.uptime}
                        timestamp={dynamicData?.timestamp}
                        isPaused={isPaused}
                    />

                    {/* Dynamic Load Average & Container Information */}
                    <LoadAverageCard
                        loadavgData={dynamicData?.loadavg}
                        dockerData={dynamicData?.docker}
                        timestamp={dynamicData?.timestamp}
                        isPaused={isPaused}
                    />
                </div>

                {/* Debug & Developer Tools Accordion */}
                <div className="mt-8">
                    <Accordion title="🛠️ Debug & Developer Tools" defaultOpen={false}>
                        <div className="space-y-4">
                            {/* Connection Status */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Connection Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="dark:text-gray-300">Static Data:</span>
                                        <span className={staticData ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                            {staticData ? '✅ Loaded' : '❌ Missing'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="dark:text-gray-300">Dynamic Data:</span>
                                        <span className={dynamicData ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                            {dynamicData ? '✅ Connected' : '❌ Waiting'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="dark:text-gray-300">WebSocket:</span>
                                        <span className={
                                            connected ? 'text-green-600 dark:text-green-400' :
                                                reconnecting ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                        }>
                                            {connected ? '🟢 Connected' : reconnecting ? '🟡 Reconnecting' : '🔴 Disconnected'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="dark:text-gray-300">Environment:</span>
                                        <span className="text-blue-600 dark:text-blue-400">{process.env.NODE_ENV || 'development'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Server Configuration */}
                            <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Server Configuration</h3>
                                <div className="text-xs space-y-1 dark:text-gray-300">
                                    <div><span className="font-medium">Static API:</span> {baseUrl}/api/static</div>
                                    <div><span className="font-medium">WebSocket:</span> {wsUrl}</div>
                                    <div><span className="font-medium">Host:</span> {window.location.hostname}</div>
                                    <div><span className="font-medium">Protocol:</span> {window.location.protocol}</div>
                                </div>
                            </div>

                            {/* Data Information */}
                            {(staticData || dynamicData) && (
                                <div className="bg-green-50 dark:bg-green-900/50 p-3 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Data Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        {staticData && (
                                            <div>
                                                <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">Static Data Keys:</div>
                                                <div className="text-gray-500 dark:text-gray-400">{Object.keys(staticData).join(', ')}</div>
                                            </div>
                                        )}
                                        {dynamicData && (
                                            <div>
                                                <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">Dynamic Data Keys:</div>
                                                <div className="text-gray-500 dark:text-gray-400">{Object.keys(dynamicData).join(', ')}</div>
                                                {dynamicData.timestamp && (
                                                    <div className="mt-1">
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">Last Update:</span>
                                                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                                                            {new Date(dynamicData.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Control Buttons */}
                            <div className="bg-purple-50 dark:bg-purple-900/50 p-3 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Control Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={refetchStaticData}
                                        className="px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                    >
                                        🔄 Refetch Static Data
                                    </button>
                                    <button
                                        onClick={() => sendMessage({ type: 'ping' })}
                                        className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!connected}
                                    >
                                        🏓 Ping WebSocket
                                    </button>
                                    <button
                                        onClick={() => sendMessage({ type: 'requestDynamic' })}
                                        className="px-3 py-2 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!connected}
                                    >
                                        📊 Request Dynamic Data
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-3 py-2 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                                    >
                                        🔄 Reload Page
                                    </button>
                                </div>
                            </div>

                            {/* Raw Data View */}
                            {(staticData || dynamicData) && (
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Raw Data (JSON)</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {staticData && (
                                            <div>
                                                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Static Data:</div>
                                                <pre className="text-xs bg-white dark:bg-gray-800 dark:text-gray-300 p-2 rounded border dark:border-gray-600 overflow-auto max-h-32">
                                                    {JSON.stringify(staticData, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {dynamicData && (
                                            <div>
                                                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dynamic Data:</div>
                                                <pre className="text-xs bg-white dark:bg-gray-800 dark:text-gray-300 p-2 rounded border dark:border-gray-600 overflow-auto max-h-32">
                                                    {JSON.stringify(dynamicData, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Accordion>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;
