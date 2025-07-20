import React, { useState, useEffect } from 'react';
import { isStandalone } from '../utils/pwa';

const NativeAppBehavior = ({ children }) => {
    const [isApp, setIsApp] = useState(false);
    const [statusBarHeight, setStatusBarHeight] = useState(0);

    useEffect(() => {
        // Check if running as installed PWA
        setIsApp(isStandalone());

        // Calculate status bar height for Android
        const calculateStatusBarHeight = () => {
            if (isStandalone()) {
                // On Android PWA, we need to account for status bar
                const safeAreaTop = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--safe-area-inset-top') || '0');
                setStatusBarHeight(safeAreaTop || 24); // Default 24px for Android status bar
            }
        };

        calculateStatusBarHeight();

        // Listen for orientation changes
        window.addEventListener('resize', calculateStatusBarHeight);
        return () => window.removeEventListener('resize', calculateStatusBarHeight);
    }, []);

    // Add native app styles when running as PWA
    useEffect(() => {
        if (isApp) {
            document.body.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
            document.body.classList.add('pwa-mode');

            // Prevent pull-to-refresh on Android
            document.body.style.overscrollBehavior = 'none';

            // Prevent zoom on double-tap
            let lastTouchEnd = 0;
            const preventZoom = (e) => {
                const now = new Date().getTime();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            };

            document.addEventListener('touchend', preventZoom, { passive: false });

            return () => {
                document.removeEventListener('touchend', preventZoom);
                document.body.classList.remove('pwa-mode');
            };
        }
    }, [isApp, statusBarHeight]);

    return (
        <div className={`
      ${isApp ? 'pwa-container' : 'browser-container'}
      min-h-screen
      ${isApp ? 'pt-safe-top pb-safe-bottom' : ''}
    `}>
            {/* Virtual Status Bar for PWA */}
            {isApp && (
                <div
                    className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-orange-500"
                    style={{ height: `${statusBarHeight}px` }}
                />
            )}

            {/* App Content */}
            <div className={`
        ${isApp ? 'native-app-content' : ''}
        ${isApp ? `mt-[${statusBarHeight}px]` : ''}
      `}>
                {children}
            </div>

            {/* Native-like navigation hints for Android gestures */}
            {isApp && (
                <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-400 rounded-full mb-2 opacity-30" />
            )}
        </div>
    );
};

export default NativeAppBehavior;
