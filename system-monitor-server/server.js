const WebSocket = require('ws');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

const wss = new WebSocket.Server({ port: 8080 });

// Define host mount points
const HOST_PROC = '/host/proc';
const HOST_SYS = '/host/sys';
const HOST_ETC = '/host/etc';

function getCpuUsage() {
  try {
    const stat = fs.readFileSync(`${HOST_PROC}/stat`, 'utf8');
    const lines = stat.split('\n');
    const cpuLine = lines[0];
    const values = cpuLine.split(/\s+/).slice(1).map(Number);

    const [user, nice, system, idle, iowait, irq, softirq] = values;
    const total = user + nice + system + idle + iowait + irq + softirq;
    const usage = ((total - idle - iowait) / total) * 100;

    const cpuInfoData = fs.readFileSync(`${HOST_PROC}/cpuinfo`, 'utf8');
    const modelMatch = cpuInfoData.match(/model name\s*:\s*(.+)/);
    const coreCount = (cpuInfoData.match(/processor\s*:/g) || []).length;

    return {
      usage: parseFloat(usage.toFixed(2)),
      cores: coreCount || 1,
      model: modelMatch ? modelMatch[1].trim() : 'Unknown'
    };
  } catch (error) {
    console.error('CPU usage error:', error.message);
    return {
      usage: 0,
      cores: 1,
      model: 'Unknown CPU'
    };
  }
}

// Add this new function after the other monitoring functions
function getBatteryInfo() {
  try {
    const batteryPath = `${HOST_SYS}/class/power_supply`;
    const batteries = [];

    // Check if the power_supply directory exists
    if (!fs.existsSync(batteryPath)) {
      return null;
    }

    // Read all power supply devices
    const devices = fs.readdirSync(batteryPath);

    for (const device of devices) {
      // Only process battery devices (usually starts with BAT)
      if (device.startsWith('BAT')) {
        const basePath = `${batteryPath}/${device}`;

        try {
          const status = fs.readFileSync(`${basePath}/status`, 'utf8').trim();
          const capacity = parseInt(fs.readFileSync(`${basePath}/capacity`, 'utf8').trim());

          // Try to get additional information
          let technology = 'Unknown';
          let voltage = null;
          let current = null;
          let powerNow = null;
          let energyFull = null;
          let energyNow = null;

          try { technology = fs.readFileSync(`${basePath}/technology`, 'utf8').trim(); } catch (e) { }
          try { voltage = parseInt(fs.readFileSync(`${basePath}/voltage_now`, 'utf8').trim()) / 1000000; } catch (e) { }
          try { current = parseInt(fs.readFileSync(`${basePath}/current_now`, 'utf8').trim()) / 1000000; } catch (e) { }
          try { powerNow = parseInt(fs.readFileSync(`${basePath}/power_now`, 'utf8').trim()) / 1000000; } catch (e) { }
          try { energyFull = parseInt(fs.readFileSync(`${basePath}/energy_full`, 'utf8').trim()) / 1000000; } catch (e) { }
          try { energyNow = parseInt(fs.readFileSync(`${basePath}/energy_now`, 'utf8').trim()) / 1000000; } catch (e) { }

          // Calculate time remaining (in hours)
          let timeRemaining = null;
          if (powerNow && energyNow) {
            if (status === 'Discharging') {
              timeRemaining = energyNow / powerNow;
            } else if (status === 'Charging' && energyFull) {
              timeRemaining = (energyFull - energyNow) / powerNow;
            }
          }

          batteries.push({
            name: device,
            status: status,
            percentage: capacity,
            technology: technology,
            voltage: voltage,
            current: current,
            power: powerNow,
            energyFull: energyFull,
            energyNow: energyNow,
            timeRemaining: timeRemaining ? parseFloat(timeRemaining.toFixed(2)) : null
          });
        } catch (error) {
          console.error(`Error reading battery ${device}:`, error.message);
        }
      }
    }

    return batteries.length > 0 ? batteries : null;
  } catch (error) {
    console.error('Battery info error:', error.message);
    return null;
  }
}

function getMemoryUsage() {
  try {
    const meminfo = fs.readFileSync(`${HOST_PROC}/meminfo`, 'utf8');
    const lines = meminfo.split('\n');

    let totalMemory = 0;
    let freeMemory = 0;
    let buffers = 0;
    let cached = 0;

    for (let line of lines) {
      if (line.startsWith('MemTotal:')) {
        totalMemory = parseInt(line.split(/\s+/)[1]) * 1024;
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
      total: Math.round(totalMemory / 1024 / 1024 / 1024 * 100) / 100,
      used: Math.round(usedMemory / 1024 / 1024 / 1024 * 100) / 100,
      free: Math.round((freeMemory + buffers + cached) / 1024 / 1024 / 1024 * 100) / 100,
      usage: parseFloat(((usedMemory / totalMemory) * 100).toFixed(2))
    };
  } catch (error) {
    console.error('Memory usage error:', error.message);
    return {
      total: 0,
      used: 0,
      free: 0,
      usage: 0
    };
  }
}

function getDockerContainers() {
  try {
    // Execute docker command and get output in JSON format
    const stdout = execSync('docker ps --format "{{json .}}"', { encoding: 'utf8' });

    // Split the output into lines and parse each line as JSON
    return stdout
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
      .map(line => {
        try {
          const container = JSON.parse(line);
          return {
            id: container.ID,
            image: container.Image,
            status: container.Status,
            name: container.Names,
            ports: container.Ports || 'No ports exposed',
            created: container.CreatedAt,
            size: container.Size,
            state: container.State || (container.Status.toLowerCase().includes('up') ? 'running' : 'stopped'),
            networks: container.Networks
          };
        } catch (parseError) {
          console.error('Error parsing container data:', parseError.message);
          return null;
        }
      })
      .filter(container => container !== null); // Remove any failed parsing results

  } catch (error) {
    console.error('Docker containers error:', error.message);
    return [];
  }
}


function getTemperature() {
  try {
    // Try different temperature sources on host system
    const tempSources = [
      `${HOST_SYS}/class/thermal/thermal_zone0/temp`,
      `${HOST_SYS}/class/hwmon/hwmon0/temp1_input`,
      `${HOST_SYS}/class/hwmon/hwmon1/temp1_input`
    ];

    for (const source of tempSources) {
      if (fs.existsSync(source)) {
        const temp = parseInt(fs.readFileSync(source, 'utf8').trim()) / 1000;
        return {
          cpu: parseFloat(temp.toFixed(1)),
          sensors: [parseFloat(temp.toFixed(1))]
        };
      }
    }

    throw new Error('No temperature sensors found');
  } catch (error) {
    console.error('Temperature error:', error.message);
    return {
      cpu: null,
      sensors: []
    };
  }
}

function getNetworkInfo() {
  try {
    const interfaces = [];
    const netInterfaces = fs.readdirSync(`${HOST_SYS}/class/net`);

    for (const iface of netInterfaces) {
      if (iface === 'lo') continue;

      try {
        const operstatePath = `${HOST_SYS}/class/net/${iface}/operstate`;
        const addressPath = `${HOST_SYS}/class/net/${iface}/address`;
        const statisticsPath = `${HOST_SYS}/class/net/${iface}/statistics`;

        if (!fs.existsSync(operstatePath)) continue;

        const operstate = fs.readFileSync(operstatePath, 'utf8').trim();
        const mac = fs.existsSync(addressPath)
          ? fs.readFileSync(addressPath, 'utf8').trim()
          : 'N/A';

        // Get IP addresses using ip command with host network namespace
        const ipOutput = execSync(`nsenter --net=/host/proc/1/ns/net ip addr show ${iface}`, { encoding: 'utf8' });
        const addresses = [];

        // Parse IPv4 addresses
        const ipv4Matches = ipOutput.matchAll(/inet\s+([0-9.]+)\/\d+/g);
        for (const match of ipv4Matches) {
          addresses.push({
            address: match[1],
            type: 'ipv4'
          });
        }

        // Parse IPv6 addresses
        const ipv6Matches = ipOutput.matchAll(/inet6\s+([a-f0-9:]+)\/\d+/g);
        for (const match of ipv6Matches) {
          if (!match[1].startsWith('fe80')) {
            addresses.push({
              address: match[1],
              type: 'ipv6'
            });
          }
        }

        // Get interface statistics
        let rxBytes = 0;
        let txBytes = 0;
        let speed = null;

        if (fs.existsSync(statisticsPath)) {
          rxBytes = parseInt(fs.readFileSync(`${statisticsPath}/rx_bytes`, 'utf8'));
          txBytes = parseInt(fs.readFileSync(`${statisticsPath}/tx_bytes`, 'utf8'));
        }

        const speedPath = `${HOST_SYS}/class/net/${iface}/speed`;
        if (fs.existsSync(speedPath)) {
          try {
            speed = parseInt(fs.readFileSync(speedPath, 'utf8'));
          } catch (e) {
            speed = null;
          }
        }

        interfaces.push({
          interface: iface,
          state: operstate,
          mac: mac,
          addresses: addresses,
          statistics: {
            rxBytes: rxBytes,
            txBytes: txBytes,
            rxMbps: speed
          }
        });
      } catch (error) {
        console.error(`Error processing interface ${iface}:`, error.message);
      }
    }

    return interfaces;
  } catch (error) {
    console.error('Network info error:', error.message);
    return [{
      interface: 'error',
      state: 'unknown',
      mac: '00:00:00:00:00:00',
      addresses: [{
        address: '0.0.0.0',
        type: 'ipv4'
      }],
      statistics: {
        rxBytes: 0,
        txBytes: 0,
        rxMbps: 0
      }
    }];
  }
}

function getUptime() {
  try {
    const uptime = fs.readFileSync(`${HOST_PROC}/uptime`, 'utf8').split(' ')[0];
    const uptimeSeconds = parseFloat(uptime);

    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return {
      raw: uptimeSeconds,
      formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
    };
  } catch (error) {
    console.error('Uptime error:', error.message);
    return {
      raw: 0,
      formatted: '0d 0h 0m 0s'
    };
  }
}

function getDiskUsage() {
  try {
    const output = execSync('df -B1 /host/', { encoding: 'utf8' });
    console.error('Disk usage output :', output);
    const lines = output.trim().split('\n');
    const parts = lines[1].split(/\s+/);

    const total = parseInt(parts[1]);
    const used = parseInt(parts[2]);
    const available = parseInt(parts[3]);
    const usage = parseFloat(parts[4].replace('%', ''));

    return {
      total: Math.round(total / 1024 / 1024 / 1024 * 100) / 100,
      used: Math.round(used / 1024 / 1024 / 1024 * 100) / 100,
      available: Math.round(available / 1024 / 1024 / 1024 * 100) / 100,
      usage: usage
    };
  } catch (error) {
    console.error('Disk usage error:', error.message);
    return {
      total: 0,
      used: 0,
      available: 0,
      usage: 0
    };
  }
}

function getLoadAverage() {
  try {
    const loadavg = fs.readFileSync(`${HOST_PROC}/loadavg`, 'utf8').split(' ');
    return {
      '1min': parseFloat(loadavg[0]),
      '5min': parseFloat(loadavg[1]),
      '15min': parseFloat(loadavg[2])
    };
  } catch (error) {
    console.error('Load average error:', error.message);
    return {
      '1min': 0,
      '5min': 0,
      '15min': 0
    };
  }
}

function getHostname() {
  try {
    return fs.readFileSync(`${HOST_ETC}/hostname`, 'utf8').trim();
  } catch (error) {
    console.error('Hostname error:', error.message);
    return 'unknown';
  }
}

function getSystemInfo() {
  return {
    timestamp: Date.now(),
    hostname: getHostname(),
    platform: 'Linux',
    arch: os.arch(),
    cpu: getCpuUsage(),
    memory: getMemoryUsage(),
    temperature: getTemperature(),
    uptime: getUptime(),
    network: getNetworkInfo(),
    disk: getDiskUsage(),
    loadavg: getLoadAverage(),
    battery: getBatteryInfo(),
    docker: getDockerContainers()
  };
}

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
  const interval = setInterval(sendSystemInfo, 1000);

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