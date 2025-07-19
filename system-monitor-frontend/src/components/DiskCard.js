import React from 'react';
import { HardDrive } from 'lucide-react';
import CircularProgress from './CircularProgress';
import StatusCard from './StatusCard';

const DiskCard = ({ diskData }) => (
    <StatusCard title="Disk Usage" icon={HardDrive}>
        <div className="text-center">
            <CircularProgress
                value={diskData.usage}
                color={
                    diskData.usage > 80
                        ? "red"
                        : diskData.usage > 60
                            ? "yellow"
                            : "green"
                }
            />
            <div className="mt-2 sm:mt-3 space-y-1">
                <p className="text-xs sm:text-sm text-gray-600">
                    {diskData.used} GB / {diskData.total} GB
                </p>
                <div className="flex justify-center">
                    <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${diskData.usage > 80
                            ? "bg-red-100 text-red-800"
                            : diskData.usage > 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                    >
                        {diskData.available} GB free
                    </span>
                </div>
            </div>
        </div>
    </StatusCard>
);

export default DiskCard;
