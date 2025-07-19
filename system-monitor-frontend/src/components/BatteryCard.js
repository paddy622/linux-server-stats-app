import React from 'react';
import { Battery, BatteryLow, Zap } from 'lucide-react';
import CircularProgress from './CircularProgress';
import StatusCard from './StatusCard';
import CardSpinner from './CardSpinner';

const BatteryCard = ({ batteryData, timestamp }) => {
    return (
        <StatusCard
            title="Battery Status"
            icon={Battery}
        >
            <div className="text-center">
                {batteryData ? (
                    <>

                        {batteryData.length > 0 ? (
                            (() => {
                                // Get the first battery (most systems have only one)
                                const battery = batteryData[0];

                                const getStatusIcon = () => {
                                    if (battery.status === "Charging") return Zap;
                                    if (battery.percentage <= 20) return BatteryLow;
                                    return Battery;
                                };

                                return (
                                    <>
                                        <CircularProgress
                                            value={battery.percentage}
                                            color={
                                                battery.percentage > 60
                                                    ? "green"
                                                    : battery.percentage > 20
                                                        ? "yellow"
                                                        : "red"
                                            }
                                        />

                                        <div className="mt-2 sm:mt-3 space-y-1">
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                {battery.percentage}% charged
                                            </p>

                                            {/* Status Badge */}
                                            <div className="flex justify-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${battery.status === "Charging"
                                                        ? "bg-green-100 text-green-800"
                                                        : battery.status === "Discharging"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-blue-100 text-blue-800"
                                                        }`}
                                                >
                                                    {battery.status}
                                                </span>
                                            </div>

                                            {/* Time Remaining */}
                                            {battery.timeRemaining !== null && (
                                                <p className="text-xs text-gray-500">
                                                    {battery.timeRemaining.toFixed(1)}h remaining
                                                </p>
                                            )}

                                            {/* Additional Info - Power */}
                                            {battery.power && (
                                                <p className="text-xs text-gray-500">
                                                    {battery.power.toFixed(1)}W power
                                                </p>
                                            )}
                                        </div>
                                    </>
                                );
                            })()
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                <div className="text-xl sm:text-2xl mb-2">N/A</div>
                                <div className="text-xs sm:text-sm">No battery detected</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-8">
                        <CardSpinner />
                        <p className="text-xs text-gray-500 mt-2">Loading battery data...</p>
                    </div>
                )}
            </div>
        </StatusCard>
    );
};

export default BatteryCard;
