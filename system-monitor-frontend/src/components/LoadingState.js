import React from 'react';
import { Activity } from 'lucide-react';

const LoadingState = ({ title, subtitle, icon: Icon = Activity }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Icon className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {subtitle}
            </p>
            <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        </div>
    </div>
);

export default LoadingState;
