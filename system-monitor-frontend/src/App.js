import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Monitor,
  Network,
  Thermometer,
  Clock,
  Server,
  QrCode,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const SystemMonitor = () => {
  const [systemData, setSystemData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // WebSocket connection
    const websocket = new WebSocket(`ws://${window.location.hostname}:5001`);

    websocket.onopen = () => {
      console.log("Connected to WebSocket server");
      setConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSystemData(data);
    };

    websocket.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setConnected(false);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const CircularProgress = ({
    value,
    max = 100,
    size = 80,
    strokeWidth = 6,
    color = "blue",
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    const colorClasses = {
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
      red: "text-red-500",
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`transition-all duration-500 ${colorClasses[color]}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-lg sm:text-xl font-bold">{value}%</div>
        </div>
      </div>
    );
  };

  const StatusCard = ({ title, children, icon: Icon, className = "" }) => (
    <div
      className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-blue-50 rounded-lg p-2 mr-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Server className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Connecting to Server...
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Make sure the WebSocket server is running on port 8080
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!systemData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
          <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Loading System Data...
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Gathering server metrics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="bg-blue-500 rounded-lg p-2 mr-3">
              <Server className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              System Monitor
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium">Host:</span>
                <span className="ml-1 truncate">{systemData.hostname}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Platform:</span>
                <span className="ml-1">{systemData.platform}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Arch:</span>
                <span className="ml-1">{systemData.arch}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span className="font-medium text-green-600">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* CPU Usage */}
          <StatusCard title="CPU Usage" icon={Cpu}>
            <div className="text-center">
              <CircularProgress
                value={systemData.cpu.usage}
                color={
                  systemData.cpu.usage > 80
                    ? "red"
                    : systemData.cpu.usage > 60
                      ? "yellow"
                      : "green"
                }
              />
              <div className="mt-2 sm:mt-3 space-y-1">
                <p className="text-xs sm:text-sm text-gray-600">
                  {systemData.cpu.cores} cores
                </p>
                <div className="flex justify-center">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${systemData.cpu.usage > 80
                      ? "bg-red-100 text-red-800"
                      : systemData.cpu.usage > 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                      }`}
                  >
                    {systemData.cpu.usage > 80
                      ? "High"
                      : systemData.cpu.usage > 60
                        ? "Medium"
                        : "Low"}
                  </span>
                </div>
              </div>
            </div>
          </StatusCard>

          {/* Memory Usage */}
          <StatusCard title="Memory Usage" icon={Monitor}>
            <div className="text-center">
              <CircularProgress
                value={systemData.memory.usage}
                color={
                  systemData.memory.usage > 80
                    ? "red"
                    : systemData.memory.usage > 60
                      ? "yellow"
                      : "green"
                }
              />
              <div className="mt-2 sm:mt-3 space-y-1">
                <p className="text-xs sm:text-sm text-gray-600">
                  {systemData.memory.used}GB / {systemData.memory.total}GB
                </p>
                <div className="flex justify-center">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${systemData.memory.usage > 80
                      ? "bg-red-100 text-red-800"
                      : systemData.memory.usage > 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                      }`}
                  >
                    {systemData.memory.free}GB free
                  </span>
                </div>
              </div>
            </div>
          </StatusCard>

          {/* Disk Usage */}
          <StatusCard title="Disk Usage" icon={HardDrive}>
            <div className="text-center">
              <CircularProgress
                value={systemData.disk.usage}
                color={
                  systemData.disk.usage > 80
                    ? "red"
                    : systemData.disk.usage > 60
                      ? "yellow"
                      : "green"
                }
              />
              <div className="mt-2 sm:mt-3 space-y-1">
                <p className="text-xs sm:text-sm text-gray-600">
                  {systemData.disk.used} / {systemData.disk.total}
                </p>
                <div className="flex justify-center">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${systemData.disk.usage > 80
                      ? "bg-red-100 text-red-800"
                      : systemData.disk.usage > 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                      }`}
                  >
                    {systemData.disk.available} free
                  </span>
                </div>
              </div>
            </div>
          </StatusCard>

          {/* Temperature */}
          <StatusCard title="Temperature" icon={Thermometer}>
            <div className="text-center">
              {systemData.temperature.cpu ? (
                <>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 mb-3">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {systemData.temperature.cpu}°C
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${systemData.temperature.cpu > 70
                        ? "bg-red-100 text-red-800"
                        : systemData.temperature.cpu > 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                        }`}
                    >
                      {systemData.temperature.cpu > 70
                        ? "Hot"
                        : systemData.temperature.cpu > 50
                          ? "Warm"
                          : "Normal"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <div className="text-xl sm:text-2xl mb-2">N/A</div>
                  <div className="text-xs sm:text-sm">Sensor not available</div>
                </div>
              )}
            </div>
          </StatusCard>
        </div>

        {/* Detailed Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* System Information */}
          <StatusCard title="System Information" icon={Server}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Hostname</div>
                  <div className="font-medium text-sm sm:text-base break-all">
                    {systemData.hostname}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Platform</div>
                  <div className="font-medium text-sm sm:text-base">
                    {systemData.platform}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Architecture</div>
                  <div className="font-medium text-sm sm:text-base">
                    {systemData.arch}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">CPU Model</div>
                  <div className="font-medium text-xs sm:text-sm break-all">
                    {systemData.cpu.model}
                  </div>
                </div>

                {/* Add Battery Information Section */}
                {systemData.battery && systemData.battery.map((battery, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">Battery Status</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Charge</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${battery.percentage > 80
                          ? "bg-green-100 text-green-800"
                          : battery.percentage > 20
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}>
                          {battery.percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${battery.status === "Charging"
                          ? "bg-green-100 text-green-800"
                          : battery.status === "Discharging"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                          }`}>
                          {battery.status}
                        </span>
                      </div>
                      {battery.timeRemaining !== null && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Time Remaining</span>
                          <span className="text-sm">
                            {battery.timeRemaining.toFixed(1)} hours
                          </span>
                        </div>
                      )}
                      {battery.technology && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Technology</span>
                          <span className="text-sm">{battery.technology}</span>
                        </div>
                      )}
                      {battery.voltage && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Voltage</span>
                          <span className="text-sm">{battery.voltage.toFixed(1)}V</span>
                        </div>
                      )}
                      {battery.power && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Power</span>
                          <span className="text-sm">{battery.power.toFixed(1)}W</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="bg-gray-50 rounded-lg p-3">
                  <QRCodeCanvas
                    value={window.location.origin}
                    size={128}
                    bgColor="#ffffff"
                    fgColor="#1e40af"
                    level="H"
                    includeMargin={true}
                  />
                  <div className="font-medium text-xs sm:text-sm break-all">
                    {window.location.origin}
                  </div>
                </div>
              </div>
            </div>
          </StatusCard>

          {/* Network Information */}
          <StatusCard title="Network & Uptime" icon={Network}>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-blue-600 mb-1">System Uptime</div>
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="font-medium text-sm sm:text-base text-blue-800">
                  {systemData.uptime.formatted}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Network Interfaces
                </div>
                {systemData.network.map((iface, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {/* Interface Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-sm">{iface.interface}</div>
                        <div className={`px-2 py-0.5 rounded-full text-xs ${iface.state === 'up'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {iface.state}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${iface.state === 'up' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                    </div>

                    {/* MAC Address */}
                    <div className="text-xs text-gray-500">
                      MAC: <span className="font-mono">{iface.mac}</span>
                    </div>

                    {/* IP Addresses */}
                    <div className="space-y-1">
                      {iface.addresses.map((addr, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${addr.type === 'ipv4'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                            }`}>
                            {addr.type.toUpperCase()}
                          </span>
                          <span className="text-sm font-mono">{addr.address}</span>
                        </div>
                      ))}
                    </div>

                    {/* Network Statistics */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-gray-100 rounded p-2">
                        <div className="text-xs text-gray-500">Received</div>
                        <div className="text-sm font-medium">
                          {(iface.statistics.rxBytes / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded p-2">
                        <div className="text-xs text-gray-500">Transmitted</div>
                        <div className="text-sm font-medium">
                          {(iface.statistics.txBytes / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded p-2">
                        <div className="text-xs text-gray-500">Speed</div>
                        <div className="text-sm font-medium">
                          {iface.statistics.rxMbps
                            ? `${iface.statistics.rxMbps} Mbps`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </StatusCard>

          {/* Load Average & Stats */}
          <StatusCard
            title="Load Average"
            icon={Activity}
            className="lg:col-span-2 xl:col-span-1"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">
                    {systemData.loadavg["1min"]}
                  </div>
                  <div className="text-xs text-blue-500">1 min</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    {systemData.loadavg["5min"]}
                  </div>
                  <div className="text-xs text-green-500">5 min</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-purple-600">
                    {systemData.loadavg["15min"]}
                  </div>
                  <div className="text-xs text-purple-500">15 min</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Last Update</div>
                <div className="font-medium text-sm">
                  {new Date(systemData.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Auto-refresh every second
                </div>
              </div>
            </div>
          </StatusCard>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
