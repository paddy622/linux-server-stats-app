import React from 'react';
import { Server, Info } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import StatusCard from './StatusCard';
import BatteryInfo from './BatteryInfo';

const SystemInfoCard = ({ staticData, batteryData }) => {
    if (!staticData) return null;

    return (
        <StatusCard title="System Information" icon={Server}>
            <div className="space-y-3">
                {/* Static Information Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">Static Information</span>
                    </div>
                    <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        Loaded once
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Hostname</div>
                        <div className="font-medium text-sm sm:text-base break-all">
                            {staticData.hostname}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Platform</div>
                        <div className="font-medium text-sm sm:text-base">
                            {staticData.platform}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Architecture</div>
                        <div className="font-medium text-sm sm:text-base">
                            {staticData.arch}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">CPU Model</div>
                        <div className="font-medium text-xs sm:text-sm break-all">
                            {staticData.cpu?.model || 'Unknown'}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">CPU Cores</div>
                        <div className="font-medium text-sm sm:text-base">
                            {staticData.cpu?.cores || 1} cores
                        </div>
                    </div>

                    {/* Battery Information - if available, show as dynamic since it can change */}
                    {batteryData && <BatteryInfo batteryData={batteryData} />}

                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-2">Access URL</div>
                        <QRCodeCanvas
                            value={window.location.origin}
                            size={128}
                            bgColor="#ffffff"
                            fgColor="#1e40af"
                            level="H"
                            includeMargin={true}
                        />
                        <div className="font-medium text-xs sm:text-sm break-all mt-2">
                            {window.location.origin}
                        </div>
                    </div>
                </div>
            </div>
        </StatusCard>
    );
};

export default SystemInfoCard;
