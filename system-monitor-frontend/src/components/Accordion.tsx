import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between text-left transition-colors"
            >
                <span className="font-medium text-gray-700 dark:text-gray-300">{title}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
            </button>
            {isOpen && (
                <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
