import React from 'react';

const BatteryInfo = ({ batteryData }) => {
    if (!batteryData || batteryData.length === 0) return null;

    return (
        <div className="space-y-3">
            {batteryData.map((battery, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Battery Status</div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium dark:text-white">Charge</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${battery.percentage > 80
                                ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400"
                                : battery.percentage > 20
                                    ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400"
                                    : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400"
                                }`}>
                                {battery.percentage}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium dark:text-white">Status</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${battery.status === "Charging"
                                ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400"
                                : battery.status === "Discharging"
                                    ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400"
                                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400"
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
