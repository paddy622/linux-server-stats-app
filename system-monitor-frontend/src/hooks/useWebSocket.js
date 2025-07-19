import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url) => {
    const [staticData, setStaticData] = useState(null);
    const [dynamicData, setDynamicData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [ws, setWs] = useState(null);
    const [reconnecting, setReconnecting] = useState(false);
    const [staticDataLoading, setStaticDataLoading] = useState(true);
    const [staticDataError, setStaticDataError] = useState(null);
    const reconnectTimeoutRef = useRef(null);
    const staticDataRef = useRef(null);

    // Fetch static data from HTTP endpoint
    const fetchStaticData = async () => {
        try {
            setStaticDataLoading(true);
            setStaticDataError(null);

            // Extract hostname and port from WebSocket URL
            const wsUrl = new URL(url);
            const staticEndpoint = `http://${wsUrl.host}/api/static`;

            console.log('Fetching static data from:', staticEndpoint);

            const response = await fetch(staticEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Static data received:', result);

            if (result.type === 'static' && result.data) {
                setStaticData(result.data);
                staticDataRef.current = result.data;
                setStaticDataLoading(false);
                return result.data;
            } else {
                throw new Error('Invalid static data format received');
            }
        } catch (error) {
            console.error('Failed to fetch static data:', error);
            setStaticDataError(error.message);
            setStaticDataLoading(false);
            return null;
        }
    };

    const connect = () => {
        try {
            console.log('Connecting to WebSocket for dynamic data:', url);
            const websocket = new WebSocket(url);

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
                } else if (message.type === 'static') {
                    // Handle static data from WebSocket (fallback)
                    console.log('Received static data via WebSocket (fallback)');
                    if (!staticDataRef.current) {
                        setStaticData(message.data);
                        staticDataRef.current = message.data;
                    }
                } else if (message.type === 'full') {
                    // Handle full data (legacy support)
                    console.log('Received full data via WebSocket (legacy)');
                    const data = message.data;

                    // Extract static data if not already set
                    if (!staticDataRef.current) {
                        const newStaticData = {
                            hostname: data.hostname,
                            platform: data.platform,
                            arch: data.arch,
                            cpu: {
                                model: data.cpu?.model,
                                cores: data.cpu?.cores
                            }
                        };
                        setStaticData(newStaticData);
                        staticDataRef.current = newStaticData;
                    }

                    // Update dynamic data
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
        let websocket = null;

        const initializeConnection = async () => {
            // First, fetch static data from HTTP endpoint
            await fetchStaticData();

            // Then connect to WebSocket for dynamic data
            websocket = connect();
        };

        initializeConnection();

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
    }, [url]);

    // Restore static data from ref if it exists but state is null
    useEffect(() => {
        if (staticDataRef.current && !staticData) {
            setStaticData(staticDataRef.current);
        }
    }, [staticData]);

    // Combine static and dynamic data for backward compatibility
    const systemData = staticData && dynamicData ? {
        ...staticData,
        ...dynamicData,
        cpu: {
            ...staticData.cpu,
            ...dynamicData.cpu
        }
    } : null;

    return {
        systemData,
        staticData,
        dynamicData,
        connected,
        reconnecting,
        ws,
        staticDataLoading,
        staticDataError,
        isInitialLoad: !staticDataRef.current || !dynamicData
    };
};

export default useWebSocket;
