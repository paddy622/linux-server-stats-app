import React from 'react';

const StatusCard = ({ title, children, icon: Icon, className = "" }) => (
    <div
        className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
        <div className="flex items-center mb-3 sm:mb-4">
            <div className="bg-blue-50 rounded-lg p-2 mr-3">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                {title}
            </h3>
        </div>
        {children}
    </div>
);

export default StatusCard;
