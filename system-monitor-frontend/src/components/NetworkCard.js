import React from 'react';
import { Network, Clock, Activity } from 'lucide-react';
import StatusCard from './StatusCard';
import DynamicDataIndicator from './DynamicDataIndicator';
import CardSpinner from './CardSpinner';

const NetworkCard = ({ networkData, uptimeData, timestamp }) => (
    <StatusCard title="Network & Uptime" icon={Network}>
        <div className="space-y-3">
            {(networkData && uptimeData) ? (
                <>
                    {/* Dynamic Indicator */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Live Data</span>
                        </div>
                        <DynamicDataIndicator lastUpdate={timestamp} />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-blue-600 mb-1">System Uptime</div>
                            <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="font-medium text-sm sm:text-base text-blue-800">
                            {uptimeData.formatted}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                            Network Interfaces
                        </div>
                        {networkData.map((iface, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                                {/* Interface Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-2">
                                        <div className="font-medium text-sm">{iface.interface}</div>
                                        <div className={`px-2 py-0.5 rounded-full text-xs ${iface.state === 'up'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {iface.state}
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${iface.state === 'up' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                </div>

                                {/* MAC Address */}
                                <div className="text-xs text-gray-500">
                                    MAC: <span className="font-mono">{iface.mac}</span>
                                </div>

                                {/* IP Addresses */}
                                <div className="space-y-1">
                                    {iface.addresses.map((addr, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <span className={`px-1.5 py-0.5 rounded text-xs ${addr.type === 'ipv4'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {addr.type.toUpperCase()}
                                            </span>
                                            <span className="text-sm font-mono">{addr.address}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Network Statistics */}
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <div className="bg-gray-100 rounded p-2">
                                        <div className="text-xs text-gray-500">Received</div>
                                        <div className="text-sm font-medium">
                                            {(iface.statistics.rxBytes / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 rounded p-2">
                                        <div className="text-xs text-gray-500">Transmitted</div>
                                        <div className="text-sm font-medium">
                                            {(iface.statistics.txBytes / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 rounded p-2">
                                        <div className="text-xs text-gray-500">Speed</div>
                                        <div className="text-sm font-medium">
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
