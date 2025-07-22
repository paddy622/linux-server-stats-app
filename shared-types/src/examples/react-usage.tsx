// Example usage of shared types in React frontend
import React, { useState, useEffect } from 'react';
import {
    DynamicSystemInfo,
    StaticSystemInfo,
    WebSocketMessage,
    AllWebSocketMessages,
    LoadingState,
    Theme,
    RefreshInterval
} from '../index';

// Example React hook using the shared types
export function useSystemData() {
    const [staticData, setStaticData] = useState<StaticSystemInfo | null>();
    const [dynamicData, setDynamicData] = useState<DynamicSystemInfo | null>();
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    const handleWebSocketMessage = (message: AllWebSocketMessages) => {
        switch (message.type) {
            case 'static':
                setStaticData(message.data);
                break;
            case 'dynamic':
                setDynamicData(message.data);
                break;
        }
        setLoadingState({ isLoading: false, error: null });
    };

    return {
        staticData,
        dynamicData,
        loadingState,
        handleWebSocketMessage
    };
}

// Example component props interface
interface SystemMonitorProps {
    theme: Theme;
    refreshInterval: RefreshInterval;
    onThemeChange: (theme: Theme) => void;
}

// Example React component using the types
export const SystemMonitorExample: React.FC<SystemMonitorProps> = ({
    theme,
    refreshInterval,
    onThemeChange
}) => {
    const { staticData, dynamicData, loadingState } = useSystemData();

    if (loadingState.isLoading) {
        return <div>Loading system data...</div>;
    }

    if (loadingState.error) {
        return <div>Error: {loadingState.error}</div>;
    }

    return (
        <div className={`system-monitor ${theme}`}>
            <h1>System Monitor</h1>

            {staticData && (
                <div className="static-info">
                    <h2>System Information</h2>
                    <p>Hostname: {staticData.hostname}</p>
                    <p>Platform: {staticData.platform}</p>
                    <p>Architecture: {staticData.arch}</p>
                    <p>CPU Model: {staticData.cpu.model}</p>
                    <p>CPU Cores: {staticData.cpu.cores}</p>
                </div>
            )}

            {dynamicData && (
                <div className="dynamic-info">
                    <h2>Live Statistics</h2>
                    <p>CPU Usage: {dynamicData.cpu.usage}%</p>
                    <p>Memory Usage: {dynamicData.memory.usage}%</p>
                    <p>Load Average: {dynamicData.loadavg['1min']}</p>
                    <p>Uptime: {dynamicData.uptime.formatted}</p>
                </div>
            )}

            <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
                Switch to {theme === 'light' ? 'dark' : 'light'} theme
            </button>
        </div>
    );
};
