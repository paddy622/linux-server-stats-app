import React from 'react';
import { RefreshCw } from 'lucide-react';

const DynamicDataIndicator = ({ lastUpdate, refreshInterval = 5000, isRefreshing = false }) => {
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Last: {formatTime(lastUpdate)}</span>
            <span>•</span>
            <span>Auto-refresh: {refreshInterval / 1000}s</span>
        </div>
    );
};

export default DynamicDataIndicator;
