import React from 'react';
import { Cpu, Activity } from 'lucide-react';
import CircularProgress from './CircularProgress';
import StatusCard from './StatusCard';
import DynamicDataIndicator from './DynamicDataIndicator';

const CpuCard = ({ cpuData, timestamp }) => (
    <StatusCard title="CPU Usage" icon={Cpu}>
        <div className="text-center">
            {/* Dynamic Indicator */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
                <DynamicDataIndicator lastUpdate={timestamp} />
            </div>

            <CircularProgress
                value={cpuData.usage}
                color={
                    cpuData.usage > 80
                        ? "red"
                        : cpuData.usage > 60
                            ? "yellow"
                            : "green"
                }
            />
            <div className="mt-2 sm:mt-3 space-y-1">
                <p className="text-xs sm:text-sm text-gray-600">
                    {cpuData.cores} cores
                </p>
                <div className="flex justify-center">
                    <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${cpuData.usage > 80
                            ? "bg-red-100 text-red-800"
                            : cpuData.usage > 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                    >
                        {cpuData.usage > 80
                            ? "High"
                            : cpuData.usage > 60
                                ? "Medium"
                                : "Low"}
                    </span>
                </div>
            </div>
        </div>
    </StatusCard>
); export default CpuCard;
