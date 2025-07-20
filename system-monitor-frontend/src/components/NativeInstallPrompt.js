import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Star } from 'lucide-react';
import { pwaInstaller, isStandalone, isAndroid } from '../utils/pwa';

const NativeInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        // Don't show if already installed
        if (isStandalone()) return;

        // Check if install prompt is available
        const checkInstallability = () => {
            setCanInstall(pwaInstaller.canShowInstallPrompt());
        };

        checkInstallability();

        // Show prompt after a delay if on Android
        if (isAndroid() && !localStorage.getItem('install-prompt-dismissed')) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 10000); // Show after 10 seconds

            return () => clearTimeout(timer);
        }

        // Listen for install prompt availability
        const handleBeforeInstallPrompt = () => {
            setCanInstall(true);
            if (isAndroid()) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (!pwaInstaller.canShowInstallPrompt()) return;

        setInstalling(true);
        try {
            const installed = await pwaInstaller.showInstallPrompt();
            if (installed) {
                setShowPrompt(false);
            }
        } catch (error) {
            console.error('Installation failed:', error);
        } finally {
            setInstalling(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('install-prompt-dismissed', 'true');
    };

    if (!showPrompt || !canInstall || isStandalone()) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
                {/* Native-style modal */}
                <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto transform transition-transform">
                    {/* Handle bar for mobile */}
                    <div className="flex justify-center pt-2 pb-4 sm:hidden">
                        <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pb-8">
                        {/* Header with close button */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center">
                                    <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Install System Monitor
                                    </h3>
                                    <div className="flex items-center space-x-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        ))}
                                        <span className="text-xs text-gray-500 ml-1">4.9</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Works offline - Access your dashboard anytime
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Native app experience - Faster and smoother
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Real-time notifications - Stay updated
                                </span>
                            </div>
                        </div>

                        {/* Install button */}
                        <div className="space-y-3">
                            <button
                                onClick={handleInstall}
                                disabled={installing}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-2xl font-semibold text-base transition-colors flex items-center justify-center space-x-2 shadow-lg"
                            >
                                {installing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Installing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        <span>Install App</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleDismiss}
                                className="w-full text-gray-600 dark:text-gray-400 py-3 px-6 rounded-2xl font-medium text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Not now
                            </button>
                        </div>

                        {/* Privacy note */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                            Free app • No ads • Your data stays private
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NativeInstallPrompt;
