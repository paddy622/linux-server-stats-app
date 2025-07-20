import React from 'react';
import { Server, Info } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import ThemeToggle from './ThemeToggle';
import InstallButton from './InstallButton';

const Header = ({ hostname, platform, arch, connected, reconnecting = false, staticData }) => {
    const getConnectionStatus = () => {
        if (connected) return { color: 'text-green-600', bg: 'bg-green-500', text: 'Connected' };
        if (reconnecting) return { color: 'text-yellow-600', bg: 'bg-yellow-500', text: 'Reconnecting...' };
        return { color: 'text-red-600', bg: 'bg-red-500', text: 'Disconnected' };
    };

    const status = getConnectionStatus();

    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center">
                    <div className="bg-blue-500 rounded-lg p-2 mr-3">
                        <Server className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                        System Monitor
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <InstallButton />
                    <ThemeToggle />
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${status.bg} ${reconnecting ? 'animate-pulse' : ''}`}></div>
                        <span className={`font-medium ${status.color} text-sm sm:text-base`}>
                            {status.text}
                        </span>
                    </div>
                </div>
            </div>

            {/* Detailed System Information */}
            {staticData && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    {/* Static Information Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">System Information</span>
                        </div>
                        <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                            Static Data
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Left Column - System Details */}
                        <div className="space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CPU Model</div>
                                <div className="font-medium text-xs sm:text-sm break-all dark:text-white">
                                    {staticData.cpu?.model || 'Unknown'}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CPU Cores</div>
                                <div className="font-medium text-sm sm:text-base dark:text-white">
                                    {staticData.cpu?.cores || 1} cores
                                </div>
                            </div>
                        </div>

                        {/* Middle Column - Additional Info */}
                        <div className="space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Hostname</div>
                                <div className="font-medium text-sm sm:text-base break-all dark:text-white">
                                    {staticData.hostname}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform Details</div>
                                <div className="font-medium text-sm sm:text-base dark:text-white">
                                    {staticData.platform}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Architecture</div>
                                <div className="font-medium text-sm sm:text-base dark:text-white">
                                    {staticData.arch}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - QR Code */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Access URL</div>
                            <QRCodeCanvas
                                value={window.location.origin}
                                size={120}
                                bgColor="#ffffff"
                                fgColor="#1e40af"
                                level="H"
                                includeMargin={true}
                            />
                            <div className="font-medium text-xs break-all mt-2">
                                {window.location.origin}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
