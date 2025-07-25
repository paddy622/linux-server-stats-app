import React from 'react';
import { Clock, Pause, Play } from 'lucide-react';

interface RefreshIntervalSelectorProps {
    interval: number;
    onIntervalChange: (interval: number) => void;
    isPaused: boolean;
    onTogglePause: () => void;
}

const RefreshIntervalSelector: React.FC<RefreshIntervalSelectorProps> = ({
    interval,
    onIntervalChange,
    isPaused,
    onTogglePause
}) => {
    const intervalOptions = [
        { value: 1000, label: '1 second' },
        { value: 2000, label: '2 seconds' },
        { value: 5000, label: '5 seconds' },
        { value: 10000, label: '10 seconds' },
        { value: 30000, label: '30 seconds' },
        { value: 60000, label: '1 minute' }
    ];

    return (
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 transition-colors duration-300">
            <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Refresh:</span>
            </div>

            <select
                value={interval}
                onChange={(e) => onIntervalChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isPaused}
            >
                {intervalOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <button
                onClick={onTogglePause}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${isPaused
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                title={isPaused ? 'Resume auto refresh' : 'Pause auto refresh'}
            >
                {isPaused ? (
                    <>
                        <Play className="w-3 h-3" />
                        <span>Resume</span>
                    </>
                ) : (
                    <>
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                    </>
                )}
            </button>

            {!isPaused && (
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                </div>
            )}
        </div>
    );
};

export default RefreshIntervalSelector;
