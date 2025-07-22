"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("ws"));
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const systemMonitor_1 = require("./systemMonitor");
// Create HTTP server
const server = http.createServer((req, res) => {
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
            const staticData = (0, systemMonitor_1.getStaticSystemInfo)();
            const response = {
                type: 'static',
                data: staticData,
                timestamp: Date.now()
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            console.log('Static data served via HTTP');
        }
        catch (error) {
            console.error('Error serving static data:', error);
            const errorResponse = {
                error: 'Failed to retrieve static data',
                timestamp: Date.now()
            };
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
        }
    }
    else if (path === '/api/health' && req.method === 'GET') {
        // Health check endpoint
        const healthResponse = {
            status: 'healthy',
            timestamp: Date.now(),
            services: {
                http: 'running',
                websocket: 'running'
            }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthResponse));
    }
    else {
        // 404 for unknown routes
        const errorResponse = {
            error: 'Not found',
            timestamp: Date.now()
        };
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorResponse));
    }
});
// Create WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    const sendDynamicInfo = () => {
        if (ws.readyState === WebSocket.OPEN) {
            const dynamicData = (0, systemMonitor_1.getDynamicSystemInfo)();
            const response = {
                type: 'dynamic',
                data: dynamicData,
                timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));
        }
    };
    // Send initial dynamic data immediately when client connects
    sendDynamicInfo();
    ws.on('message', (message) => {
        try {
            const request = JSON.parse(message.toString());
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
        }
        catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
    ws.on('error', (error) => {
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
//# sourceMappingURL=server.js.map