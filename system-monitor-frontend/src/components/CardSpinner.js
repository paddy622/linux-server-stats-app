import React from 'react';

const CardSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2'
    };

    return (
        <div className="flex items-center justify-center py-4">
            <div className={`animate-spin rounded-full border-gray-300 border-t-blue-500 ${sizeClasses[size]}`}></div>
        </div>
    );
};

export default CardSpinner;
