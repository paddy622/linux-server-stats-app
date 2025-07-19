import React from 'react';
import { Activity } from 'lucide-react';
import StatusCard from './StatusCard';
import DockerContainers from './DockerContainers';

const LoadAverageCard = ({ loadavgData, dockerData, timestamp }) => (
    <StatusCard
        title="Load Average & Stats"
        icon={Activity}
        className="lg:col-span-2 xl:col-span-1"
    >
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                        {loadavgData["1min"]}
                    </div>
                    <div className="text-xs text-blue-500">1 min</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                        {loadavgData["5min"]}
                    </div>
                    <div className="text-xs text-green-500">5 min</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-purple-600">
                        {loadavgData["15min"]}
                    </div>
                    <div className="text-xs text-purple-500">15 min</div>
                </div>
            </div>

            {/* Docker Containers Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">Docker Containers</div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {dockerData?.length || 0} containers
                    </div>
                </div>

                <DockerContainers containers={dockerData} />
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Last Update</div>
                <div className="font-medium text-sm">
                    {new Date(timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    Auto-refresh every 5 seconds
                </div>
            </div>
        </div>
    </StatusCard>
);

export default LoadAverageCard;
