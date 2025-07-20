import React, { useState, useEffect } from 'react';
import { Server } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Show splash screen for minimum 2 seconds for app-like feel
        const timer = setTimeout(() => {
            setFadeOut(true);
            // Additional delay for fade out animation
            setTimeout(() => {
                setIsVisible(false);
                onComplete && onComplete();
            }, 500);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className={`
      fixed inset-0 z-50 flex flex-col items-center justify-center
      bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500
      transition-opacity duration-500
      ${fadeOut ? 'opacity-0' : 'opacity-100'}
    `}>
            {/* App Logo */}
            <div className="mb-8 relative">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                    <Server className="w-12 h-12 text-blue-600" />
                </div>
                {/* Pulse animation */}
                <div className="absolute inset-0 w-24 h-24 bg-white rounded-3xl animate-pulse opacity-30"></div>
            </div>

            {/* App Name */}
            <h1 className="text-white text-3xl font-bold mb-2 text-center">
                System Monitor
            </h1>
            <p className="text-white/80 text-lg mb-8 text-center px-8">
                Real-time server monitoring
            </p>

            {/* Loading indicator */}
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            </div>

            {/* Version info */}
            <div className="absolute bottom-8 text-white/60 text-sm">
                v1.0.0
            </div>
        </div>
    );
};

export default SplashScreen;
