import React from 'react';
import { Activity, Pause } from 'lucide-react';

const StatusCard = ({ title, children, icon: Icon, className = "", isPaused = false }) => (
    <div
        className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center">
                <div className="bg-blue-50 rounded-lg p-2 mr-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                    {title}
                </h3>
            </div>
            <div className="flex items-center space-x-1">
                {isPaused ? (
                    <>
                        <Pause className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Paused</span>
                    </>
                ) : (
                    <>
                        <Activity className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Live</span>
                    </>
                )}
            </div>
        </div>
        {children}
    </div>
);

export default StatusCard;
