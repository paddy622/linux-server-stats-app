import React from 'react';
import { Server } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import StatusCard from './StatusCard';
import BatteryInfo from './BatteryInfo';

const SystemInfoCard = ({ systemData }) => (
    <StatusCard title="System Information" icon={Server}>
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Hostname</div>
                    <div className="font-medium text-sm sm:text-base break-all">
                        {systemData.hostname}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Platform</div>
                    <div className="font-medium text-sm sm:text-base">
                        {systemData.platform}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Architecture</div>
                    <div className="font-medium text-sm sm:text-base">
                        {systemData.arch}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">CPU Model</div>
                    <div className="font-medium text-xs sm:text-sm break-all">
                        {systemData.cpu.model}
                    </div>
                </div>

                {/* Battery Information Section */}
                <BatteryInfo batteryData={systemData.battery} />

                <div className="bg-gray-50 rounded-lg p-3 text-center">
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

export default SystemInfoCard;
