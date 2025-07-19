import React from 'react';
import { Server } from 'lucide-react';

const DockerContainer = ({ container }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
        {/* Container Header */}
        <div className="flex justify-between items-start mb-3">
            <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-base text-gray-900 dark:text-white">
                        {container.name}
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${container.state === 'running'
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400'
                            }`}
                    >
                        {container.state}
                    </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    ID: {container.id.slice(0, 12)}
                </div>
            </div>
            <div
                className={`w-3 h-3 rounded-full ${container.state === 'running'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                    }`}
            ></div>
        </div>

        {/* Container Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
                {/* Image */}
                <div className="bg-white dark:bg-gray-600 rounded-lg p-3 border border-gray-100 dark:border-gray-500">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Image
                    </div>
                    <div className="text-sm font-mono break-all dark:text-white">
                        {container.image}
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white dark:bg-gray-600 rounded-lg p-3 border border-gray-100 dark:border-gray-500">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Status
                    </div>
                    <div className="text-sm dark:text-white">
                        {container.status}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
                {/* Ports */}
                <div className="bg-white dark:bg-gray-600 rounded-lg p-3 border border-gray-100 dark:border-gray-500">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Ports
                    </div>
                    <div className="text-sm font-mono break-all dark:text-white">
                        {container.ports || 'No ports exposed'}
                    </div>
                </div>
            </div>
        </div>

        {/* Container Actions */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex space-x-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-md text-xs text-gray-600 dark:text-gray-300">
                    {container.state === 'running' ? 'Running since' : 'Stopped since'}: {
                        container.status.includes('Up') || container.status.includes('Exited')
                            ? container.status.split(' ')[1] + ' ' + container.status.split(' ')[2]
                            : 'Unknown'
                    }
                </span>
            </div>
        </div>
    </div>
);

const DockerContainers = ({ containers }) => {
    if (!containers || containers.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                <div className="text-gray-500 dark:text-gray-400">
                    <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <div className="text-sm font-medium">No containers running</div>
                    <div className="text-xs mt-1">Start a container to see it listed here</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {containers.map((container) => (
                <DockerContainer key={container.id} container={container} />
            ))}
        </div>
    );
};

export default DockerContainers;
