import React from 'react';
import { Network, Clock } from 'lucide-react';
import StatusCard from './StatusCard';
import CardSpinner from './CardSpinner';

const NetworkCard = ({ networkData, uptimeData, timestamp, isPaused = false }) => (
    <StatusCard
        title="Network & Uptime"
        icon={Network}
        isPaused={isPaused}
    >
        <div className="space-y-3">
            {(networkData && uptimeData) ? (
                <>

                    <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">System Uptime</div>
                            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="font-medium text-sm sm:text-base text-blue-800 dark:text-blue-300">
                            {uptimeData.formatted}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Network Interfaces
                        </div>
                        {networkData.map((iface, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                                {/* Interface Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-2">
                                        <div className="font-medium text-sm dark:text-white">{iface.interface}</div>
                                        <div className={`px-2 py-0.5 rounded-full text-xs ${iface.state === 'up'
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                            }`}>
                                            {iface.state}
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${iface.state === 'up' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                </div>

                                {/* MAC Address */}
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    MAC: <span className="font-mono">{iface.mac}</span>
                                </div>

                                {/* IP Addresses */}
                                <div className="space-y-1">
                                    {iface.addresses.map((addr, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <span className={`px-1.5 py-0.5 rounded text-xs ${addr.type === 'ipv4'
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                                                : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                                                }`}>
                                                {addr.type.toUpperCase()}
                                            </span>
                                            <span className="text-sm font-mono dark:text-white">{addr.address}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Network Statistics */}
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <div className="bg-gray-100 dark:bg-gray-600 rounded p-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Received</div>
                                        <div className="text-sm font-medium dark:text-white">
                                            {(iface.statistics.rxBytes / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-600 rounded p-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Transmitted</div>
                                        <div className="text-sm font-medium dark:text-white">
                                            {(iface.statistics.txBytes / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-600 rounded p-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Speed</div>
                                        <div className="text-sm font-medium dark:text-white">
                                            {iface.statistics.rxMbps
                                                ? `${iface.statistics.rxMbps} Mbps`
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="py-8">
                    <CardSpinner />
                    <p className="text-xs text-gray-500 mt-2">Loading network data...</p>
                </div>
            )}
        </div>
    </StatusCard>
);

export default NetworkCard;
