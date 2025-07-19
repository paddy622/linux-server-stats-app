import { useState, useEffect } from 'react';

const useWebSocket = (url) => {
    const [staticData, setStaticData] = useState(null);
    const [dynamicData, setDynamicData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [ws, setWs] = useState(null);

    // Static data fields that don't change frequently
    const staticFields = ['hostname', 'platform', 'arch'];

    // CPU model and core count are also relatively static
    const staticCpuFields = ['model', 'cores'];

    useEffect(() => {
        // WebSocket connection
        const websocket = new WebSocket(url);

        websocket.onopen = () => {
            console.log('Connected to WebSocket server');
            setConnected(true);
            setWs(websocket);
        };

        websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            // Handle different message types from server
            if (message.type === 'static') {
                // Server sent static data
                setStaticData(message.data);
                console.log('Received static data from server');
            } else if (message.type === 'dynamic') {
                // Server sent dynamic data
                setDynamicData(message.data);
            } else if (message.type === 'full') {
                // Server sent full data (fallback or initial)
                const data = message.data;

                // Extract static data if not already set
                if (!staticData) {
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
                if (!staticData) {
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
        }; websocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnected(false);
        };

        return () => {
            websocket.close();
        };
    }, [url]);

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
        ws,
        isInitialLoad: !staticData || !dynamicData
    };
};

export default useWebSocket;
