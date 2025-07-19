import React from 'react';

const BatteryInfo = ({ batteryData }) => {
    if (!batteryData || batteryData.length === 0) return null;

    return (
        <div className="space-y-3">
            {batteryData.map((battery, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">Battery Status</div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Charge</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${battery.percentage > 80
                                    ? "bg-green-100 text-green-800"
                                    : battery.percentage > 20
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                }`}>
                                {battery.percentage}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Status</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${battery.status === "Charging"
                                    ? "bg-green-100 text-green-800"
                                    : battery.status === "Discharging"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}>
                                {battery.status}
                            </span>
                        </div>
                        {battery.timeRemaining !== null && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Time Remaining</span>
                                <span className="text-sm">
                                    {battery.timeRemaining.toFixed(1)} hours
                                </span>
                            </div>
                        )}
                        {battery.technology && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Technology</span>
                                <span className="text-sm">{battery.technology}</span>
                            </div>
                        )}
                        {battery.voltage && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Voltage</span>
                                <span className="text-sm">{battery.voltage.toFixed(1)}V</span>
                            </div>
                        )}
                        {battery.power && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Power</span>
                                <span className="text-sm">{battery.power.toFixed(1)}W</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BatteryInfo;
