import React from 'react';
import { Monitor } from 'lucide-react';
import CircularProgress from './CircularProgress';
import StatusCard from './StatusCard';

const MemoryCard = ({ memoryData }) => (
    <StatusCard title="Memory Usage" icon={Monitor}>
        <div className="text-center">
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
                <p className="text-xs sm:text-sm text-gray-600">
                    {memoryData.used}GB / {memoryData.total}GB
                </p>
                <div className="flex justify-center">
                    <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${memoryData.usage > 80
                            ? "bg-red-100 text-red-800"
                            : memoryData.usage > 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                    >
                        {memoryData.free}GB free
                    </span>
                </div>
            </div>
        </div>
    </StatusCard>
);

export default MemoryCard;
