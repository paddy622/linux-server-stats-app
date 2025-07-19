import React, { useState } from 'react';
import { ExternalLink, Globe, AlertCircle } from 'lucide-react';

const AppTile = ({
    name,
    port,
    path = '',
    icon = null,
    description = '',
    hostname = window.location.hostname || 'localhost'
}) => {
    const [iconError, setIconError] = useState(false);
    const [iconLoading, setIconLoading] = useState(true);

    // Ensure hostname is not empty or "unknown"
    const resolvedHostname = hostname && hostname !== 'unknown' ? hostname : 'localhost';

    const appUrl = `http://${resolvedHostname}:${port}${path}`;
    const faviconUrl = icon || `http://${resolvedHostname}:${port}/favicon.ico`;

    const handleIconError = () => {
        setIconError(true);
        setIconLoading(false);
    };

    const handleIconLoad = () => {
        setIconLoading(false);
        setIconError(false);
    };

    const handleTileClick = () => {
        window.open(appUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            onClick={handleTileClick}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-start space-x-3">
                {/* App Icon */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {!iconError ? (
                            <>
                                {iconLoading && (
                                    <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
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
                            <Globe className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                </div>

                {/* App Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                            {name}
                        </h4>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>

                    {description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 font-mono">
                            :{port}
                        </span>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover URL Preview */}
            <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Open:</span>
                    <span className="text-xs text-blue-600 font-mono truncate">
                        {appUrl}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AppTile;
