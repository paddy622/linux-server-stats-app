import { useState, useEffect, useRef } from 'react';

const useDynamicData = (wsUrl) => {
    const [dynamicData, setDynamicData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);
    const [ws, setWs] = useState(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = () => {
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

                    const newDynamicData = {
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
            if (websocket) {
                websocket.close();
            }
        };
    }, [wsUrl]);

    // Send a message to the WebSocket server
    const sendMessage = (message) => {
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
