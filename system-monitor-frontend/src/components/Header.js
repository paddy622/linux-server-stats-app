import React from 'react';
import { Server } from 'lucide-react';

const Header = ({ hostname, platform, arch, connected, reconnecting = false }) => {
    const getConnectionStatus = () => {
        if (connected) return { color: 'text-green-600', bg: 'bg-green-500', text: 'Connected' };
        if (reconnecting) return { color: 'text-yellow-600', bg: 'bg-yellow-500', text: 'Reconnecting...' };
        return { color: 'text-red-600', bg: 'bg-red-500', text: 'Disconnected' };
    };

    const status = getConnectionStatus();

    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-blue-500 rounded-lg p-2 mr-3">
                    <Server className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    System Monitor
                </h1>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                        <span className="font-medium">Host:</span>
                        <span className="ml-1 truncate">{hostname}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-medium">Platform:</span>
                        <span className="ml-1">{platform}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-medium">Arch:</span>
                        <span className="ml-1">{arch}</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-1 ${status.bg} ${reconnecting ? 'animate-pulse' : ''}`}></div>
                        <span className={`font-medium ${status.color}`}>
                            {status.text}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
