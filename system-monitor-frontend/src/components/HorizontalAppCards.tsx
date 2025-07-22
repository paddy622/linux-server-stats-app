import React, { useState } from 'react';
import { Grid3X3, Plus, Settings } from 'lucide-react';

interface App {
    name: string;
    port: number;
    path: string;
    protocol: 'http' | 'https' | 'smb';
    description: string;
    icon?: string | null;
}

interface AppCardProps {
    app: App;
    hostname: string;
    index: number;
}

const AppCard: React.FC<AppCardProps> = ({ app, hostname, index }) => {
    const [iconError, setIconError] = useState<boolean>(false);
    const [iconLoading, setIconLoading] = useState<boolean>(true);

    const faviconUrl = app.protocol !== 'smb' ?
        `${app.protocol}://${hostname}:${app.port}/favicon.ico` :
        null;

    const handleIconError = (): void => {
        setIconError(true);
        setIconLoading(false);
    };

    const handleIconLoad = (): void => {
        setIconLoading(false);
        setIconError(false);
    };

    const handleClick = (): void => {
        let appUrl: string;
        if (app.protocol === 'smb') {
            appUrl = `smb://${hostname}`;

            // Try different methods to open file manager with SMB URL
            const userAgent = navigator.userAgent.toLowerCase();
            const isMac = userAgent.includes('mac');
            const isWindows = userAgent.includes('win');
            const isLinux = userAgent.includes('linux');

            try {
                if (isMac) {
                    // On macOS, try to open Finder with smb:// URL
                    window.location.href = appUrl;
                } else if (isWindows) {
                    // On Windows, try to open Explorer with the UNC path
                    const uncPath = `\\\\${hostname}`;
                    window.location.href = `file://${uncPath}`;
                } else {
                    // On Linux and others, try the smb:// protocol
                    window.location.href = appUrl;
                }
            } catch (error) {
                // If direct opening fails, provide instructions and copy to clipboard
                let instructions = '';
                if (isMac) {
                    instructions = 'In Finder, press Cmd+K and paste the address.';
                } else if (isWindows) {
                    instructions = 'In File Explorer, press Ctrl+L and paste the address.';
                } else {
                    instructions = 'Open your file manager and navigate to the SMB share.';
                }

                navigator.clipboard.writeText(appUrl).then(() => {
                    alert(`SMB address copied to clipboard: ${appUrl}\n${instructions}`);
                }).catch(() => {
                    alert(`SMB address: ${appUrl}\n${instructions}`);
                });
            }
        } else {
            appUrl = `${app.protocol}://${hostname}:${app.port}${app.path}`;
            window.open(appUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            key={`${app.name}-${app.port}-${index}`}
            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border border-gray-100 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={handleClick}
        >
            <div className="flex flex-col items-center text-center space-y-3">
                {/* App Icon */}
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden">
                    {faviconUrl && !iconError ? (
                        <>
                            {iconLoading && (
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {app.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <img
                                src={faviconUrl}
                                alt={`${app.name} favicon`}
                                className={`w-8 h-8 object-contain ${iconLoading ? 'hidden' : 'block'}`}
                                onError={handleIconError}
                                onLoad={handleIconLoad}
                            />
                        </>
                    ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                {app.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* App Name */}
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {app.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {app.description}
                    </p>
                </div>

                {/* Port/Protocol Info */}
                <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {app.protocol === 'smb' ? 'SMB' : `:${app.port}`}
                    </span>
                    <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                    </div>
                </div>

                {/* Protocol Badge */}
                <div className="w-full">
                    {app.protocol === 'https' && (
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            HTTPS
                        </span>
                    )}
                    {app.protocol === 'http' && (
                        <span className="inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                            HTTP
                        </span>
                    )}
                    {app.protocol === 'smb' && (
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            SMB
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

interface HorizontalAppCardsProps {
    apps?: App[];
    hostname?: string;
    showAddButton?: boolean;
    onAddApp?: (() => void) | null;
}

const HorizontalAppCards: React.FC<HorizontalAppCardsProps> = ({
    apps = [],
    hostname = window.location.hostname || 'localhost',
    showAddButton = false,
    onAddApp = null
}) => {
    const defaultApps: App[] = [
        {
            name: 'Portainer',
            port: 9443,
            path: '',
            protocol: 'https',
            description: 'Docker container management'
        },
        {
            name: 'Immich',
            port: 2283,
            path: '',
            protocol: 'http',
            description: 'Photo Backup',
        },
        {
            name: 'Pi-hole',
            port: 9080,
            path: '/admin',
            protocol: 'http',
            description: 'Network-wide ad blocking',
        },
        {
            name: 'Samba',
            port: 445,
            path: '',
            protocol: 'smb',
            description: 'File sharing server',
            icon: null
        }
    ];

    // Use provided apps or default apps
    const appList = apps.length > 0 ? apps : defaultApps;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Grid3X3 className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Hosted Applications</h2>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                        {appList.length} apps
                    </div>
                    {showAddButton && onAddApp && (
                        <button
                            onClick={onAddApp}
                            className="flex items-center space-x-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm text-gray-700 dark:text-gray-300"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add App</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Horizontal App Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {appList.map((app, index) => (
                    <AppCard
                        key={`${app.name}-${app.port}-${index}`}
                        app={app}
                        hostname={hostname}
                        index={index}
                    />
                ))}
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-center pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Manage Applications</span>
                </button>
            </div>
        </div>
    );
};

export default HorizontalAppCards;
