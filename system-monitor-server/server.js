const WebSocket = require('ws');
const { getSystemInfo, getStaticSystemInfo, getDynamicSystemInfo } = require('./systemMonitor');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  let staticDataSent = false;

  const sendStaticInfo = () => {
    if (ws.readyState === WebSocket.OPEN && !staticDataSent) {
      const staticData = getStaticSystemInfo();
      ws.send(JSON.stringify({
        type: 'static',
        data: staticData,
        timestamp: Date.now()
      }));
      staticDataSent = true;
      console.log('Static data sent to client');
    }
  };

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

  const sendFullSystemInfo = () => {
    if (ws.readyState === WebSocket.OPEN) {
      // Send complete data for backward compatibility if needed
      const fullData = getSystemInfo();
      ws.send(JSON.stringify({
        type: 'full',
        data: fullData,
        timestamp: Date.now()
      }));
    }
  };

  // Send static data immediately upon connection
  sendStaticInfo();

  // Send initial dynamic data
  sendDynamicInfo();

  // Send dynamic updates every 5 seconds
  const dynamicInterval = setInterval(sendDynamicInfo, 5000);

  // Optionally send full data every 30 seconds for fallback/sync
  const fullDataInterval = setInterval(sendFullSystemInfo, 30000);

  ws.on('message', (message) => {
    try {
      const request = JSON.parse(message);

      switch (request.type) {
        case 'requestStatic':
          sendStaticInfo();
          break;
        case 'requestDynamic':
          sendDynamicInfo();
          break;
        case 'requestFull':
          sendFullSystemInfo();
          break;
        default:
          console.log('Unknown request type:', request.type);
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(dynamicInterval);
    clearInterval(fullDataInterval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(dynamicInterval);
    clearInterval(fullDataInterval);
  });
});

console.log('WebSocket server started on port 8080');
console.log('System monitoring active...');