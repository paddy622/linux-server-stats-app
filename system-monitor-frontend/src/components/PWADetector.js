import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Info } from 'lucide-react';
import { isAndroid, isStandalone, canInstallOnAndroid } from '../utils/pwa';

const PWADetector = () => {
    const [showInstructions, setShowInstructions] = useState(false);
    const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the banner
        const dismissed = localStorage.getItem('pwa-instructions-dismissed');
        if (dismissed) {
            setHasBeenDismissed(true);
            return;
        }

        // Show instructions if on mobile and not installed
        if ((isAndroid() || /iPhone|iPad|iPod/.test(navigator.userAgent)) && !isStandalone()) {
            setShowInstructions(true);
        }
    }, []);

    const dismissInstructions = () => {
        setShowInstructions(false);
        setHasBeenDismissed(true);
        localStorage.setItem('pwa-instructions-dismissed', 'true');
    };

    const getInstructions = () => {
        if (isAndroid()) {
            return {
                title: "Install on Android",
                icon: <Smartphone className="w-5 h-5" />,
                steps: [
                    "Open this page in Chrome browser",
                    "Tap the menu (⋮) in the top right",
                    "Select 'Add to Home screen'",
                    "Tap 'Add' to confirm"
                ]
            };
        } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            return {
                title: "Install on iOS",
                icon: <Smartphone className="w-5 h-5" />,
                steps: [
                    "Open this page in Safari browser",
                    "Tap the Share button (□↗)",
                    "Scroll down and tap 'Add to Home Screen'",
                    "Tap 'Add' to confirm"
                ]
            };
        } else {
            return {
                title: "Install on Desktop",
                icon: <Monitor className="w-5 h-5" />,
                steps: [
                    "Look for the install icon in your browser's address bar",
                    "Click the install button when it appears",
                    "Follow the browser's installation prompts"
                ]
            };
        }
    };

    if (!showInstructions || hasBeenDismissed || isStandalone()) {
        return null;
    }

    const instructions = getInstructions();

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        {instructions.icon}
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {instructions.title}
                        </h3>
                    </div>
                    <button
                        onClick={dismissInstructions}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-start space-x-2 mb-3">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Install this app for a better experience with offline access
                    </p>
                </div>

                <ol className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {instructions.steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                            <span className="inline-block w-4 h-4 bg-blue-500 text-white rounded-full text-center text-xs leading-4 mr-2 flex-shrink-0">
                                {index + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>

                <div className="flex space-x-2 mt-3">
                    <button
                        onClick={dismissInstructions}
                        className="flex-1 text-center py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        Not now
                    </button>
                    <button
                        onClick={dismissInstructions}
                        className="flex-1 text-center py-2 px-3 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWADetector;
