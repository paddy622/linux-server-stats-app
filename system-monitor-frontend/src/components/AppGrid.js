import React from 'react';
import { Grid3X3, Plus, Settings } from 'lucide-react';
import AppTile from './AppTile';

const AppGrid = ({
    apps = [],
    hostname = window.location.hostname || 'localhost',
    showAddButton = false,
    onAddApp = null
}) => {
    const defaultApps = [
        {
            name: 'Portainer',
            port: 9443,
            path: '',
            protocol: 'https', // Use HTTPS for Portainer
            description: 'Docker container management'
        },
        {
            name: 'Immich',
            port: 2283,
            path: '',
            protocol: 'http', // Use HTTP for Immich
            description: 'Photo Backup',
        },
        {
            name: 'Pi-hole',
            port: 9080,
            path: '/admin',
            protocol: 'http', // Use HTTP for Pi-hole
            description: 'Network-wide ad blocking',
        },
        {
            name: 'Samba',
            port: 445,
            path: '',
            protocol: 'smb', // Use SMB protocol for Samba
            description: 'File sharing server',
            icon: null // Will show generic globe icon
        }
    ];

    // Use provided apps or default apps
    const appList = apps.length > 0 ? apps : defaultApps;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Grid3X3 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hosted Applications</span>
                </div>
                <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                    {appList.length} apps
                </div>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-1 gap-3">
                {appList.map((app, index) => (
                    <AppTile
                        key={`${app.name}-${app.port}-${index}`}
                        name={app.name}
                        port={app.port}
                        path={app.path}
                        protocol={app.protocol || 'http'}
                        icon={app.icon}
                        description={app.description}
                        hostname={hostname}
                    />
                ))}
            </div>

            {/* Add New App Button */}
            {showAddButton && onAddApp && (
                <button
                    onClick={onAddApp}
                    className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                    <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Add Application
                    </span>
                </button>
            )}

            {/* Quick Actions */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <button className="w-full flex items-center justify-center space-x-2 p-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                    <Settings className="w-3 h-3" />
                    <span>Manage Applications</span>
                </button>
            </div>
        </div>
    );
};

export default AppGrid;
