import React from 'react';
import { Server } from 'lucide-react';
import { DockerContainer as DockerContainerType } from '@linux-server-stats/shared-types';

interface DockerContainerProps {
    container: DockerContainerType;
}

const DockerContainer: React.FC<DockerContainerProps> = ({ container }) => (
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

        {/* Container Details */}
        <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Image:</span> {container.image}
            </div>
            {container.ports && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Ports:</span> {container.ports}
                </div>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Status:</span> {container.status}
            </div>
        </div>
    </div>
);

interface DockerContainersProps {
    containers?: DockerContainerType[];
}

const DockerContainers: React.FC<DockerContainersProps> = ({ containers }) => {
    if (!containers || containers.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No containers running</div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {containers.map((container, index) => (
                <DockerContainer key={container.id || index} container={container} />
            ))}
        </div>
    );
};

export default DockerContainers;
