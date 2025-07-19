import React from 'react';
import { HardDrive, Activity } from 'lucide-react';
import CircularProgress from './CircularProgress';
import StatusCard from './StatusCard';
import DynamicDataIndicator from './DynamicDataIndicator';
import CardSpinner from './CardSpinner';

const SingleDiskCard = ({ diskInfo, timestamp, title }) => (
    <StatusCard title={title} icon={HardDrive}>
        <div className="text-center">
            {diskInfo ? (
                <>
                    {/* Dynamic Indicator */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Live</span>
                        </div>
                        <DynamicDataIndicator lastUpdate={timestamp} />
                    </div>

                    <CircularProgress
                        value={diskInfo.usage}
                        color={
                            diskInfo.usage > 80
                                ? "red"
                                : diskInfo.usage > 60
                                    ? "yellow"
                                    : "green"
                        }
                    />
                    <div className="mt-2 sm:mt-3 space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                            {diskInfo.used_gb} GB / {diskInfo.total_gb} GB
                        </p>
                        <p className="text-xs text-gray-500">
                            {diskInfo.device}
                        </p>
                        <p className="text-xs text-gray-500">
                            {diskInfo.mountpoint}
                        </p>
                        <div className="flex justify-center">
                            <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${diskInfo.usage > 80
                                        ? "bg-red-100 text-red-800"
                                        : diskInfo.usage > 60
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {diskInfo.available_gb} GB free
                            </span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-8">
                    <CardSpinner />
                    <p className="text-xs text-gray-500 mt-2">Loading disk data...</p>
                </div>
            )}
        </div>
    </StatusCard>
);

const DiskCards = ({ diskData, timestamp }) => {
    if (!diskData) {
        // Show a single loading card when no data is available
        return (
            <div className="col-span-full">
                <SingleDiskCard diskInfo={null} timestamp={timestamp} title="Disk Usage" />
            </div>
        );
    }

    // If we have filesystems data, show individual cards for each
    if (diskData.filesystems && diskData.filesystems.length > 0) {
        return (
            <>
                {diskData.filesystems.map((filesystem, index) => (
                    <SingleDiskCard
                        key={`${filesystem.device}-${index}`}
                        diskInfo={filesystem}
                        timestamp={timestamp}
                        title={`Disk: ${filesystem.mountpoint}`}
                    />
                ))}
            </>
        );
    }

    // Fallback: show the summary data as a single card (backward compatibility)
    const summaryDisk = {
        device: 'System Disk',
        mountpoint: '/',
        total_gb: diskData.total,
        used_gb: diskData.used,
        available_gb: diskData.available,
        usage: diskData.usage
    };

    return (
        <SingleDiskCard
            diskInfo={summaryDisk}
            timestamp={timestamp}
            title="Disk Usage"
        />
    );
};

export default DiskCards;
