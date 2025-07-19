import React, { useState } from 'react';
import { ExternalLink, Globe, AlertCircle } from 'lucide-react';

const AppTile = ({
    name,
    port,
    path = '',
    protocol = 'http',
    icon = null,
    description = '',
    hostname = window.location.hostname || 'localhost'
}) => {
    const [iconError, setIconError] = useState(false);
    const [iconLoading, setIconLoading] = useState(true);

    // Use server IP address instead of hostname, fallback to window location
    const resolvedHostname = window.location.hostname || 'localhost';

    // Handle different protocols
    let appUrl;
    if (protocol === 'smb') {
        appUrl = `smb://${resolvedHostname}`;
    } else {
        appUrl = `${protocol}://${resolvedHostname}:${port}${path}`;
    }

    // Don't use favicon.ico by default, use null to show generic icon
    const faviconUrl = icon || `${protocol}://${resolvedHostname}:${port}/favicon.ico`;


    const handleIconError = () => {
        setIconError(true);
        setIconLoading(false);
    };

    const handleIconLoad = () => {
        setIconLoading(false);
        setIconError(false);
    }; const handleTileClick = () => {
        if (protocol === 'smb') {
            // For SMB, copy the URL to clipboard and show a notification
            navigator.clipboard.writeText(appUrl).then(() => {
                alert(`SMB address copied to clipboard: ${appUrl}\nOpen this in your file manager.`);
            }).catch(() => {
                alert(`SMB address: ${appUrl}\nCopy this and open in your file manager.`);
            });
        } else {
            // For HTTP/HTTPS, open in new tab
            window.open(appUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            onClick={handleTileClick}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-start space-x-3">
                {/* App Icon */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                        {faviconUrl && !iconError ? (
                            <>
                                {iconLoading && (
                                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-500 rounded animate-pulse"></div>
                                )}
                                <img
                                    src={faviconUrl}
                                    alt={`${name} icon`}
                                    className={`w-8 h-8 object-contain ${iconLoading ? 'hidden' : 'block'}`}
                                    onError={handleIconError}
                                    onLoad={handleIconLoad}
                                />
                            </>
                        ) : (
                            <Globe className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        )}
                    </div>
                </div>

                {/* App Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {name}
                        </h4>
                        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </div>

                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                {protocol === 'smb' ? 'SMB' : `:${port}`}
                            </span>
                            {protocol === 'https' && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">HTTPS</span>
                            )}
                            {protocol === 'http' && (
                                <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">HTTP</span>
                            )}
                            {protocol === 'smb' && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">SMB</span>
                            )}
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover URL Preview */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Open:</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-mono truncate">
                        {appUrl}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AppTile;
