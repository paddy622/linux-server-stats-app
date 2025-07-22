import React from 'react';
import { Cpu } from 'lucide-react';
import { CpuUsage } from '@linux-server-stats/shared-types';
import CircularProgress from './CircularProgress';
import StatusCard from './StatusCard';
import CardSpinner from './CardSpinner';

interface CpuCardProps {
    cpuData?: CpuUsage;
    timestamp?: number;
    isPaused?: boolean;
}

const CpuCard: React.FC<CpuCardProps> = ({ cpuData, timestamp, isPaused = false }) => (
    <StatusCard
        title="CPU Usage"
        icon={Cpu}
        isPaused={isPaused}
    >
        <div className="text-center">
            {cpuData ? (
                <>
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
                        {/* <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {cpuData.cores} cores
                        </p> */}
                        <div className="flex justify-center">
                            <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${cpuData.usage > 80
                                    ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400"
                                    : cpuData.usage > 60
                                        ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400"
                                        : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400"
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
                </>
            ) : (
                <div className="py-8">
                    <CardSpinner />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Loading CPU data...</p>
                </div>
            )}
        </div>
    </StatusCard>
);

export default CpuCard;
