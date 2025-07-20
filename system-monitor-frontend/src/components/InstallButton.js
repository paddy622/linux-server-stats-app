import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { pwaInstaller, isStandalone, isAndroid, canInstallOnAndroid } from '../utils/pwa';

const InstallButton = () => {
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        // Check if app is already installed/standalone
        setIsInstalled(isStandalone());

        // Check if install prompt is available
        const checkInstallability = () => {
            setCanInstall(pwaInstaller.canShowInstallPrompt());
        };

        // Initial check
        checkInstallability();

        // Listen for install prompt availability
        const handleBeforeInstallPrompt = () => {
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setCanInstall(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Cleanup
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!pwaInstaller.canShowInstallPrompt()) return;

        setInstalling(true);
        try {
            const installed = await pwaInstaller.showInstallPrompt();
            if (installed) {
                setIsInstalled(true);
                setCanInstall(false);
            }
        } catch (error) {
            console.error('Installation failed:', error);
        } finally {
            setInstalling(false);
        }
    };

    // Don't show if already installed
    if (isInstalled) {
        return (
            <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                <Check className="w-4 h-4 mr-1" />
                <span>App Installed</span>
            </div>
        );
    }

    // Show install button if can install
    if (canInstall || canInstallOnAndroid()) {
        return (
            <button
                onClick={handleInstall}
                disabled={installing}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
                {installing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Installing...</span>
                    </>
                ) : (
                    <>
                        {isAndroid() ? (
                            <Smartphone className="w-4 h-4" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span>Install App</span>
                    </>
                )}
            </button>
        );
    }

    // Show instruction for Android users if Chrome
    if (isAndroid()) {
        return (
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Use Chrome to install</span>
            </div>
        );
    }

    return null;
};

export default InstallButton;
