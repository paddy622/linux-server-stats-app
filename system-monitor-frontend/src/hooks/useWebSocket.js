import { useState, useEffect } from 'react';

const useWebSocket = (url) => {
    const [systemData, setSystemData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // WebSocket connection
        const websocket = new WebSocket(url);

        websocket.onopen = () => {
            console.log('Connected to WebSocket server');
            setConnected(true);
            setWs(websocket);
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setSystemData(data);
        };

        websocket.onclose = () => {
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

    return { systemData, connected, ws };
};

export default useWebSocket;
