import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface CardSpinnerProps {
    size?: SpinnerSize;
}

const CardSpinner: React.FC<CardSpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses: Record<SpinnerSize, string> = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2'
    };

    return (
        <div className="flex items-center justify-center py-4">
            <div className={`animate-spin rounded-full border-gray-300 dark:border-gray-600 border-t-blue-500 ${sizeClasses[size]}`}></div>
        </div>
    );
};

export default CardSpinner;
