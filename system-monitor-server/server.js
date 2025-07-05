const WebSocket = require('ws');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Function to get CPU usage from host
function getCpuUsage() {
  try {
    // Try to read from host's /proc/stat first
    if (fs.existsSync('/host/proc/stat')) {
      const stat = fs.readFileSync('/host/proc/stat', 'utf8');
      const lines = stat.split('\n');
      const cpuLine = lines[0];
      const values = cpuLine.split(/\s+/).slice(1).map(Number);
      
      const [user, nice, system, idle, iowait, irq, softirq] = values;
      const total = user + nice + system + idle + iowait + irq + softirq;
      const usage = ((total - idle - iowait) / total) * 100;
      
      // Get CPU info from host
      let cpuInfo = { model: 'Unknown', cores: 1 };
      if (fs.existsSync('/host/proc/cpuinfo')) {
        const cpuInfoData = fs.readFileSync('/host/proc/cpuinfo', 'utf8');
        const modelMatch = cpuInfoData.match(/model name\s*:\s*(.+)/);
        const coreCount = (cpuInfoData.match(/processor\s*:/g) || []).length;
        
        cpuInfo = {
          model: modelMatch ? modelMatch[1].trim() : 'Unknown',
          cores: coreCount || 1
        };
      }
      
      return {
        usage: parseFloat(usage.toFixed(2)),
        cores: cpuInfo.cores,
        model: cpuInfo.model
      };
    }
  } catch (error) {
    console.log('Using container CPU info as fallback');
  }
  
  // Fallback to container's view
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

// Function to get memory usage from host
function getMemoryUsage() {
  try {
    // Try to read from host's /proc/meminfo
    if (fs.existsSync('/host/proc/meminfo')) {
      const meminfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
      const lines = meminfo.split('\n');
      
      let totalMemory = 0;
      let freeMemory = 0;
      let buffers = 0;
      let cached = 0;
      
      for (let line of lines) {
        if (line.startsWith('MemTotal:')) {
          totalMemory = parseInt(line.split(/\s+/)[1]) * 1024; // Convert KB to bytes
        } else if (line.startsWith('MemFree:')) {
          freeMemory = parseInt(line.split(/\s+/)[1]) * 1024;
        } else if (line.startsWith('Buffers:')) {
          buffers = parseInt(line.split(/\s+/)[1]) * 1024;
        } else if (line.startsWith('Cached:')) {
          cached = parseInt(line.split(/\s+/)[1]) * 1024;
        }
      }
      
      const usedMemory = totalMemory - freeMemory - buffers - cached;
      
      return {
        total: Math.round(totalMemory / 1024 / 1024 / 1024 * 100) / 100, // GB
        used: Math.round(usedMemory / 1024 / 1024 / 1024 * 100) / 100, // GB
        free: Math.round((freeMemory + buffers + cached) / 1024 / 1024 / 1024 * 100) / 100, // GB
        usage: parseFloat(((usedMemory / totalMemory) * 100).toFixed(2))
      };
    }
  } catch (error) {
    console.log('Using container memory info as fallback');
  }
  
  // Fallback to container's view
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

// Function to get temperature from host
function getTemperature() {
  try {
    // Try to read CPU temperature from host's thermal zone
    const tempFiles = [
      '/host/sys/class/thermal/thermal_zone0/temp',
      '/host/sys/class/thermal/thermal_zone1/temp',
      '/host/sys/class/thermal/thermal_zone2/temp'
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
    
    // Try hwmon sensors
    try {
      const hwmonPath = '/host/sys/class/hwmon';
      if (fs.existsSync(hwmonPath)) {
        const hwmonDirs = fs.readdirSync(hwmonPath);
        const temps = [];
        
        for (let dir of hwmonDirs) {
          const tempFiles = fs.readdirSync(`${hwmonPath}/${dir}`).filter(f => f.startsWith('temp') && f.endsWith('_input'));
          for (let tempFile of tempFiles) {
            try {
              const temp = fs.readFileSync(`${hwmonPath}/${dir}/${tempFile}`, 'utf8').trim();
              temps.push(parseInt(temp) / 1000);
            } catch (e) {
              continue;
            }
          }
        }
        
        if (temps.length > 0) {
          return {
            cpu: parseFloat(temps[0].toFixed(1)),
            sensors: temps.map(t => parseFloat(t.toFixed(1)))
          };
        }
      }
    } catch (error) {
      // Continue to fallback
    }
  } catch (error) {
    console.log('Temperature reading not available from host');
  }
  
  return {
    cpu: null,
    sensors: []
  };
}

// Function to get uptime from host
function getUptime() {
  try {
    // Try to read from host's /proc/uptime
    if (fs.existsSync('/host/proc/uptime')) {
      const uptimeData = fs.readFileSync('/host/proc/uptime', 'utf8');
      const uptime = parseFloat(uptimeData.split(' ')[0]);
      
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      return {
        raw: uptime,
        formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
      };
    }
  } catch (error) {
    console.log('Using container uptime as fallback');
  }
  
  // Fallback to container's view
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

// Function to get network interfaces from host
function getNetworkInfo() {
  try {
    // Try to read from host's network interfaces
    if (fs.existsSync('/host/sys/class/net')) {
      const interfaces = fs.readdirSync('/host/sys/class/net');
      const networkInfo = [];
      
      for (let iface of interfaces) {
        if (iface === 'lo') continue; // Skip loopback
        
        try {
          const operstatePath = `/host/sys/class/net/${iface}/operstate`;
          if (fs.existsSync(operstatePath)) {
            const operstate = fs.readFileSync(operstatePath, 'utf8').trim();
            if (operstate === 'up') {
              // Try to get IP from container's view or use placeholder
              networkInfo.push({
                interface: iface,
                ip: 'Host Interface',
                netmask: 'N/A',
                mac: 'N/A',
                state: operstate
              });
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      if (networkInfo.length > 0) {
        return networkInfo;
      }
    }
  } catch (error) {
    console.log('Using container network info as fallback');
  }
  
  // Fallback to container's view
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

// Function to get disk usage from host
function getDiskUsage() {
  try {
    // Try to read from host filesystem
    if (fs.existsSync('/host/proc/mounts')) {
      const mounts = fs.readFileSync('/host/proc/mounts', 'utf8');
      const lines = mounts.split('\n');
      
      // Look for root filesystem
      for (let line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2 && parts[1] === '/') {
          try {
            const stats = fs.statSync('/host');
            // This is a simplified approach - in a real scenario you'd want to use statvfs
            return {
              total: 'Host FS',
              used: 'N/A',
              available: 'N/A',
              usage: 0
            };
          } catch (e) {
            break;
          }
        }
      }
    }
    
    // Try using df command on host root if available
    const output = execSync('df -h /host 2>/dev/null || df -h /', { encoding: 'utf8' });
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

// Function to get load average from host
function getLoadAverage() {
  try {
    // Try to read from host's /proc/loadavg
    if (fs.existsSync('/host/proc/loadavg')) {
      const loadavgData = fs.readFileSync('/host/proc/loadavg', 'utf8');
      const values = loadavgData.trim().split(/\s+/);
      
      return {
        '1min': parseFloat(parseFloat(values[0]).toFixed(2)),
        '5min': parseFloat(parseFloat(values[1]).toFixed(2)),
        '15min': parseFloat(parseFloat(values[2]).toFixed(2))
      };
    }
  } catch (error) {
    console.log('Using container load average as fallback');
  }
  
  // Fallback to container's view
  const loadavg = os.loadavg();
  return {
    '1min': parseFloat(loadavg[0].toFixed(2)),
    '5min': parseFloat(loadavg[1].toFixed(2)),
    '15min': parseFloat(loadavg[2].toFixed(2))
  };
}

// Function to get hostname from host
function getHostname() {
  try {
    if (fs.existsSync('/host/etc/hostname')) {
      return fs.readFileSync('/host/etc/hostname', 'utf8').trim();
    }
    if (fs.existsSync('/host/proc/sys/kernel/hostname')) {
      return fs.readFileSync('/host/proc/sys/kernel/hostname', 'utf8').trim();
    }
  } catch (error) {
    console.log('Using container hostname as fallback');
  }
  
  return os.hostname();
}

// Function to get OS release info from host
function getOSInfo() {
  try {
    let platform = os.platform();
    let release = os.release();
    
    // Try to get host OS info
    if (fs.existsSync('/host/etc/os-release')) {
      const osRelease = fs.readFileSync('/host/etc/os-release', 'utf8');
      const lines = osRelease.split('\n');
      let name = '';
      let version = '';
      
      for (let line of lines) {
        if (line.startsWith('NAME=')) {
          name = line.split('=')[1].replace(/"/g, '');
        } else if (line.startsWith('VERSION=')) {
          version = line.split('=')[1].replace(/"/g, '');
        }
      }
      
      if (name) {
        platform = name;
        release = version || release;
      }
    }
    
    return { platform, release };
  } catch (error) {
    return { platform: os.platform(), release: os.release() };
  }
}

// Function to gather all system info
function getSystemInfo() {
  const osInfo = getOSInfo();
  
  return {
    timestamp: Date.now(),
    hostname: getHostname(),
    platform: osInfo.platform,
    arch: os.arch(),
    release: osInfo.release,
    cpu: getCpuUsage(),
    memory: getMemoryUsage(),
    temperature: getTemperature(),
    uptime: getUptime(),
    network: getNetworkInfo(),
    disk: getDiskUsage(),
    loadavg: getLoadAverage(),
    containerized: true
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
console.log('System monitoring active (containerized with host access)...');
console.log('Host mounts expected at:');
console.log('  /host/proc -> /proc');
console.log('  /host/sys -> /sys');
console.log('  /host/etc -> /etc');