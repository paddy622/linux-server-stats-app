const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const { getSystemInfo, getStaticSystemInfo, getDynamicSystemInfo } = require('./systemMonitor');

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        type: 'static',
        data: staticData,
        timestamp: Date.now()
      }));
      console.log('Static data served via HTTP');
    } catch (error) {
      console.error('Error serving static data:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to retrieve static data' }));
    }
  } else if (path === '/api/health' && req.method === 'GET') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: Date.now(),
      services: {
        http: 'running',
        websocket: 'running'
      }
    }));
  } else {
    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Create WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  const sendDynamicInfo = () => {
    if (ws.readyState === WebSocket.OPEN) {
      const dynamicData = getDynamicSystemInfo();
      ws.send(JSON.stringify({
        type: 'dynamic',
        data: dynamicData,
        timestamp: Date.now()
      }));
    }
  };

  // Send initial dynamic data immediately
  sendDynamicInfo();

  // Send dynamic updates every 5 seconds
  const dynamicInterval = setInterval(sendDynamicInfo, 5000);

  ws.on('message', (message) => {
    try {
      const request = JSON.parse(message);

      switch (request.type) {
        case 'requestDynamic':
          sendDynamicInfo();
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
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
    clearInterval(dynamicInterval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(dynamicInterval);
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
  console.log(`Static data endpoint: http://localhost:${PORT}/api/static`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
  console.log('System monitoring active...');
});