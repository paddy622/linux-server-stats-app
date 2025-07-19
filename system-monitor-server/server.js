const WebSocket = require('ws');
const { getSystemInfo } = require('./systemMonitor');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  const sendSystemInfo = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(getSystemInfo()));
    }
  };

  // Send initial data
  sendSystemInfo();

  // Send updates every second
  const interval = setInterval(sendSystemInfo, 5000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(interval);
  });
});

console.log('WebSocket server started on port 8080');
console.log('System monitoring active...');