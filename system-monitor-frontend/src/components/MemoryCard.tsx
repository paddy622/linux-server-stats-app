import React from 'react';
import { Monitor } from 'lucide-react';
import { MemoryUsage } from '@linux-server-stats/shared-types';
import CircularProgress from './CircularProgress';
import StatusCard from './StatusCard';
import CardSpinner from './CardSpinner';

interface MemoryCardProps {
    memoryData?: MemoryUsage;
    timestamp?: number;
    isPaused?: boolean;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memoryData, timestamp, isPaused = false }) => (
    <StatusCard
        title="Memory Usage"
        icon={Monitor}
        isPaused={isPaused}
    >
        <div className="text-center">
            {memoryData ? (
                <>
                    <CircularProgress
                        value={memoryData.usage}
                        color={
                            memoryData.usage > 80
                                ? "red"
                                : memoryData.usage > 60
                                    ? "yellow"
                                    : "green"
                        }
                    />
                    <div className="mt-2 sm:mt-3 space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {memoryData.used}GB / {memoryData.total}GB used
                        </p>
                        <div className="flex justify-center">
                            <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${memoryData.usage > 80
                                    ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400"
                                    : memoryData.usage > 60
                                        ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400"
                                        : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400"
                                    }`}
                            >
                                {memoryData.free}GB free
                            </span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-8">
                    <CardSpinner />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Loading memory data...</p>
                </div>
            )}
        </div>
    </StatusCard>
);

export default MemoryCard;
