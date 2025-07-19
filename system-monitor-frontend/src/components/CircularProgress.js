import React from 'react';

const CircularProgress = ({
    value,
    max = 100,
    size = 80,
    strokeWidth = 6,
    color = "blue",
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    const colorClasses = {
        blue: "text-blue-500",
        green: "text-green-500",
        yellow: "text-yellow-500",
        red: "text-red-500",
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-600"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`transition-all duration-500 ${colorClasses[color]}`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{value}%</div>
            </div>
        </div>
    );
};

export default CircularProgress;
