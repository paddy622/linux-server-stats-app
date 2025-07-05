const WebSocket = require('ws');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Function to get CPU usage
function getCpuUsage() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  
  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  
  const total = user + nice + sys + idle + irq;
  const usage = ((total - idle) / total) * 100;
  
  return {
    usage: parseFloat(usage.toFixed(2)),
    cores: cpus.length,
    model: cpus[0].model
  };
}

// Function to get memory usage
function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  return {
    total: Math.round(totalMemory / 1024 / 1024 / 1024 * 100) / 100, // GB
    used: Math.round(usedMemory / 1024 / 1024 / 1024 * 100) / 100, // GB
    free: Math.round(freeMemory / 1024 / 1024 / 1024 * 100) / 100, // GB
    usage: parseFloat(((usedMemory / totalMemory) * 100).toFixed(2))
  };
}

// Function to get temperature (Linux specific)
function getTemperature() {
  try {
    // Try to read CPU temperature from thermal zone
    const tempFiles = [
      '/sys/class/thermal/thermal_zone0/temp',
      '/sys/class/thermal/thermal_zone1/temp'
    ];
    
    const temperatures = [];
    
    for (let file of tempFiles) {
      try {
        if (fs.existsSync(file)) {
          const temp = fs.readFileSync(file, 'utf8').trim();
          temperatures.push(parseInt(temp) / 1000); // Convert from millidegrees
        }
      } catch (e) {
        continue;
      }
    }
    
    if (temperatures.length > 0) {
      return {
        cpu: parseFloat(temperatures[0].toFixed(1)),
        sensors: temperatures.map(t => parseFloat(t.toFixed(1)))
      };
    }
  } catch (error) {
    console.log('Temperature reading not available');
  }
  
  return {
    cpu: null,
    sensors: []
  };
}

// Function to get uptime
function getUptime() {
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  return {
    raw: uptime,
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
  };
}

// Function to get network interfaces
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const networkInfo = [];
  
  for (let [name, addrs] of Object.entries(interfaces)) {
    for (let addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        networkInfo.push({
          interface: name,
          ip: addr.address,
          netmask: addr.netmask,
          mac: addr.mac
        });
      }
    }
  }
  
  return networkInfo;
}

// Function to get disk usage
function getDiskUsage() {
  try {
    const output = execSync('df -h /', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    if (lines.length > 1) {
      const parts = lines[1].split(/\s+/);
      return {
        total: parts[1],
        used: parts[2],
        available: parts[3],
        usage: parseFloat(parts[4].replace('%', ''))
      };
    }
  } catch (error) {
    console.log('Disk usage not available');
  }
  
  return {
    total: 'N/A',
    used: 'N/A',
    available: 'N/A',
    usage: 0
  };
}

// Function to get load average
function getLoadAverage() {
  const loadavg = os.loadavg();
  return {
    '1min': parseFloat(loadavg[0].toFixed(2)),
    '5min': parseFloat(loadavg[1].toFixed(2)),
    '15min': parseFloat(loadavg[2].toFixed(2))
  };
}

// Function to gather all system info
function getSystemInfo() {
  return {
    timestamp: Date.now(),
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    cpu: getCpuUsage(),
    memory: getMemoryUsage(),
    temperature: getTemperature(),
    uptime: getUptime(),
    network: getNetworkInfo(),
    disk: getDiskUsage(),
    loadavg: getLoadAverage()
  };
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send initial system info
  ws.send(JSON.stringify(getSystemInfo()));
  
  // Send system info every 2 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(getSystemInfo()));
    }
  }, 2000);
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.log('WebSocket error:', error);
    clearInterval(interval);
  });
});

console.log('WebSocket server started on port 8080');
console.log('System monitoring active...');