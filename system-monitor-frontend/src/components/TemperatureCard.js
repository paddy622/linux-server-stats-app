import React from 'react';
import { Thermometer } from 'lucide-react';
import StatusCard from './StatusCard';

const TemperatureCard = ({ temperatureData }) => (
    <StatusCard title="Temperature" icon={Thermometer}>
        <div className="text-center">
            {temperatureData.cpu ? (
                <>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 mb-3">
                        <div className="text-2xl sm:text-3xl font-bold">
                            {temperatureData.cpu}°C
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${temperatureData.cpu > 70
                                ? "bg-red-100 text-red-800"
                                : temperatureData.cpu > 50
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                        >
                            {temperatureData.cpu > 70
                                ? "Hot"
                                : temperatureData.cpu > 50
                                    ? "Warm"
                                    : "Normal"}
                        </span>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500 py-4">
                    <div className="text-xl sm:text-2xl mb-2">N/A</div>
                    <div className="text-xs sm:text-sm">Sensor not available</div>
                </div>
            )}
        </div>
    </StatusCard>
);

export default TemperatureCard;
