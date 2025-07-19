import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
            >
                <span className="font-medium text-gray-700">{title}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
            </button>
            {isOpen && (
                <div className="px-4 py-3 bg-white border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
