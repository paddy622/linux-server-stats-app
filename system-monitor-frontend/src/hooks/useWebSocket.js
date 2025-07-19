import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url) => {
    const [staticData, setStaticData] = useState(null);
    const [dynamicData, setDynamicData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [ws, setWs] = useState(null);
    const [reconnecting, setReconnecting] = useState(false);
    const reconnectTimeoutRef = useRef(null);
    const staticDataRef = useRef(null);

    const connect = () => {
        try {
            // WebSocket connection
            const websocket = new WebSocket(url);

            websocket.onopen = () => {
                console.log('Connected to WebSocket server');
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

                // Handle different message types from server
                if (message.type === 'static') {
                    // Server sent static data
                    setStaticData(message.data);
                    staticDataRef.current = message.data;
                    console.log('Received static data from server');
                } else if (message.type === 'dynamic') {
                    // Server sent dynamic data
                    setDynamicData(message.data);
                } else if (message.type === 'full') {
                    // Server sent full data (fallback or initial)
                    const data = message.data;

                    // Extract static data if not already set or preserved
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
                        cpu: {
                            usage: data.cpu?.usage
                        },
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
                    // Legacy format - handle old format for backward compatibility
                    const data = message.data || message;

                    // Separate static and dynamic data
                    if (!staticDataRef.current) {
                        // First time loading - extract static data
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

                    // Always update dynamic data
                    const newDynamicData = {
                        timestamp: data.timestamp,
                        cpu: {
                            usage: data.cpu?.usage
                        },
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
        isInitialLoad: !staticDataRef.current || !dynamicData
    };
};

export default useWebSocket;
