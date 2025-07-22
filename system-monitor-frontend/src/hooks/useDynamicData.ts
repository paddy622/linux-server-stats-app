import { useState, useEffect, useRef } from 'react';
import { DynamicSystemInfo } from '@linux-server-stats/shared-types';

interface UseDynamicDataReturn {
    dynamicData: DynamicSystemInfo | null;
    connected: boolean;
    reconnecting: boolean;
    sendMessage: (message: any) => void;
}

const useDynamicData = (wsUrl: string, refreshInterval: number | null = 2000): UseDynamicDataReturn => {
    const [dynamicData, setDynamicData] = useState<DynamicSystemInfo | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [reconnecting, setReconnecting] = useState<boolean>(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const connect = (): WebSocket | null => {
        try {
            console.log('Connecting to WebSocket for dynamic data:', wsUrl);
            const websocket = new WebSocket(wsUrl);

            websocket.onopen = () => {
                console.log('Connected to WebSocket server for dynamic data');
                setConnected(true);
                setReconnecting(false);
                setWs(websocket);

                // Clear any pending reconnection attempts
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            websocket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('WebSocket message received:', message.type);

                if (message.type === 'dynamic') {
                    // Server sent dynamic data - this is our primary use case
                    setDynamicData(message.data);
                } else if (message.type === 'pong') {
                    // Handle pong responses for connection health
                    console.log('Pong received from server');
                } else if (message.type === 'full') {
                    // Handle full data (legacy support) - extract only dynamic parts
                    console.log('Received full data via WebSocket (legacy)');
                    const data = message.data;

                    const newDynamicData: DynamicSystemInfo = {
                        timestamp: data.timestamp,
                        cpu: { usage: data.cpu?.usage },
                        memory: data.memory,
                        temperature: data.temperature,
                        uptime: data.uptime,
                        network: data.network,
                        disk: data.disk,
                        loadavg: data.loadavg,
                        battery: data.battery,
                        docker: data.docker
                    };
                    setDynamicData(newDynamicData);
                } else {
                    console.log('Unknown message type:', message.type);
                }
            };

            websocket.onclose = () => {
                console.log('Disconnected from WebSocket server');
                setConnected(false);
                setWs(null);

                // Only attempt reconnection if we're not manually closing
                if (!reconnecting) {
                    setReconnecting(true);
                    // Attempt to reconnect after 3 seconds
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        connect();
                    }, 3000);
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnected(false);
            };

            return websocket;
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnected(false);
            return null;
        }
    };

    useEffect(() => {
        if (!wsUrl) return;

        const websocket = connect();

        return () => {
            setReconnecting(true); // Prevent auto-reconnection on cleanup
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (websocket) {
                websocket.close();
            }
        };
    }, [wsUrl]);

    // Set up client-side refresh interval
    useEffect(() => {
        if (!connected || !ws) return;

        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // If refreshInterval is null (paused), don't set up interval
        if (refreshInterval === null) return;

        // Request initial data
        sendMessage({ type: 'requestDynamic' });

        // Set up new interval
        intervalRef.current = setInterval(() => {
            sendMessage({ type: 'requestDynamic' });
        }, refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [connected, refreshInterval]);

    // Send a message to the WebSocket server
    const sendMessage = (message: any): void => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

    return {
        dynamicData,
        connected,
        reconnecting,
        sendMessage
    };
};

export default useDynamicData;
