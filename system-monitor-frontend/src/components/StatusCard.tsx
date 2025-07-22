import React from 'react';
import { Activity, Pause, LucideIcon } from 'lucide-react';

interface StatusCardProps {
    title: string;
    children: React.ReactNode;
    icon: LucideIcon;
    className?: string;
    isPaused?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, children, icon: Icon, className = "", isPaused = false }) => (
    <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ${className}`}
    >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center">
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-2 mr-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white truncate">
                    {title}
                </h3>
            </div>
            <div className="flex items-center space-x-1">
                {isPaused ? (
                    <>
                        <Pause className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Paused</span>
                    </>
                ) : (
                    <>
                        <Activity className="w-3 h-3 text-green-500 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
                    </>
                )}
            </div>
        </div>
        {children}
    </div>
);

export default StatusCard;
