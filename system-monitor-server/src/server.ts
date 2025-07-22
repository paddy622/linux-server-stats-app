import * as WebSocket from 'ws';
import * as http from 'http';
import * as url from 'url';
import {
    getStaticSystemInfo,
    getDynamicSystemInfo
} from './systemMonitor';
import {
    StaticDataMessage,
    DynamicDataMessage,
    HealthCheckResponse,
    ErrorResponse
} from '@linux-server-stats/shared-types';

// Define request types for WebSocket messages
interface WebSocketRequest {
    type: string;
    [key: string]: any;
}

interface PingRequest extends WebSocketRequest {
    type: 'ping';
}

interface RequestDynamicRequest extends WebSocketRequest {
    type: 'requestDynamic';
}

// Create HTTP server
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = url.parse(req.url || '', true);
    const path = parsedUrl.pathname;

    // Set comprehensive CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${req.method} ${path} - Origin: ${req.headers.origin || 'none'}`);

    if (path === '/api/static' && req.method === 'GET') {
        // Endpoint for static system data
        try {
            const staticData = getStaticSystemInfo();
            const response: StaticDataMessage = {
                type: 'static',
                data: staticData,
                timestamp: Date.now()
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            console.log('Static data served via HTTP');
        } catch (error) {
            console.error('Error serving static data:', error);
            const errorResponse: ErrorResponse = {
                error: 'Failed to retrieve static data',
                timestamp: Date.now()
            };
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
        }
    } else if (path === '/api/health' && req.method === 'GET') {
        // Health check endpoint
        const healthResponse: HealthCheckResponse = {
            status: 'healthy',
            timestamp: Date.now(),
            services: {
                http: 'running',
                websocket: 'running'
            }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthResponse));
    } else {
        // 404 for unknown routes
        const errorResponse: ErrorResponse = {
            error: 'Not found',
            timestamp: Date.now()
        };
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorResponse));
    }
});

// Create WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    const sendDynamicInfo = (): void => {
        if (ws.readyState === WebSocket.OPEN) {
            const dynamicData = getDynamicSystemInfo();
            const response: DynamicDataMessage = {
                type: 'dynamic',
                data: dynamicData,
                timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));
        }
    };

    // Send initial dynamic data immediately when client connects
    sendDynamicInfo();

    ws.on('message', (message: WebSocket.RawData) => {
        try {
            const request: WebSocketRequest = JSON.parse(message.toString());

            switch (request.type) {
                case 'requestDynamic':
                    sendDynamicInfo();
                    break;
                case 'ping':
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now()
                    }));
                    break;
                default:
                    console.log('Unknown WebSocket request type:', request.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });

    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });
});

// Start the server
const PORT = parseInt(process.env.PORT || '8080', 10);
server.listen(PORT, () => {
    console.log(`HTTP server started on port ${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}`);
    console.log(`Static data endpoint: http://localhost:${PORT}/api/static`);
    console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
    console.log('System monitoring active...');
});
