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
exports.getCpuUsage = getCpuUsage;
exports.getCpuInfo = getCpuInfo;
exports.getBatteryInfo = getBatteryInfo;
exports.getMemoryUsage = getMemoryUsage;
exports.getDockerContainers = getDockerContainers;
exports.getTemperature = getTemperature;
exports.getNetworkInfo = getNetworkInfo;
exports.getUptime = getUptime;
exports.getDiskUsage = getDiskUsage;
exports.getLoadAverage = getLoadAverage;
exports.getHostname = getHostname;
exports.getStaticSystemInfo = getStaticSystemInfo;
exports.getDynamicSystemInfo = getDynamicSystemInfo;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
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
        return {
            usage: parseFloat(usage.toFixed(2)),
        };
    }
    catch (error) {
        console.error('CPU usage error:', error.message);
        return {
            usage: 0,
        };
    }
}
function getCpuInfo() {
    try {
        const cpuInfoData = fs.readFileSync(`${HOST_PROC}/cpuinfo`, 'utf8');
        const modelMatch = cpuInfoData.match(/model name\s*:\s*(.+)/);
        const coreCount = (cpuInfoData.match(/processor\s*:/g) || []).length;
        return {
            model: modelMatch ? modelMatch[1].trim() : 'Unknown',
            cores: coreCount || 1
        };
    }
    catch (error) {
        console.error('CPU usage error:', error.message);
        return {
            model: 'Unknown CPU',
            cores: 1
        };
    }
}
function getBatteryInfo() {
    try {
        const batteryPath = `${HOST_SYS}/class/power_supply`;
        const batteries = [];
        // Check if the power_supply directory exists
        if (!fs.existsSync(batteryPath)) {
            return [];
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
                    try {
                        technology = fs.readFileSync(`${basePath}/technology`, 'utf8').trim();
                    }
                    catch (e) { }
                    try {
                        voltage = parseInt(fs.readFileSync(`${basePath}/voltage_now`, 'utf8').trim()) / 1000000;
                    }
                    catch (e) { }
                    try {
                        current = parseInt(fs.readFileSync(`${basePath}/current_now`, 'utf8').trim()) / 1000000;
                    }
                    catch (e) { }
                    try {
                        powerNow = parseInt(fs.readFileSync(`${basePath}/power_now`, 'utf8').trim()) / 1000000;
                    }
                    catch (e) { }
                    try {
                        energyFull = parseInt(fs.readFileSync(`${basePath}/energy_full`, 'utf8').trim()) / 1000000;
                    }
                    catch (e) { }
                    try {
                        energyNow = parseInt(fs.readFileSync(`${basePath}/energy_now`, 'utf8').trim()) / 1000000;
                    }
                    catch (e) { }
                    // Calculate time remaining (in hours)
                    let timeRemaining = null;
                    if (powerNow && energyNow) {
                        if (status === 'Discharging') {
                            timeRemaining = energyNow / powerNow;
                        }
                        else if (status === 'Charging' && energyFull) {
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
                }
                catch (error) {
                    console.error(`Error reading battery ${device}:`, error.message);
                }
            }
        }
        return batteries;
    }
    catch (error) {
        console.error('Battery info error:', error.message);
        return [];
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
        for (const line of lines) {
            if (line.startsWith('MemTotal:')) {
                totalMemory = parseInt(line.split(/\s+/)[1]) * 1024;
            }
            else if (line.startsWith('MemFree:')) {
                freeMemory = parseInt(line.split(/\s+/)[1]) * 1024;
            }
            else if (line.startsWith('Buffers:')) {
                buffers = parseInt(line.split(/\s+/)[1]) * 1024;
            }
            else if (line.startsWith('Cached:')) {
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
    }
    catch (error) {
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
        const stdout = (0, child_process_1.execSync)('docker ps --format "{{json .}}"', { encoding: 'utf8' });
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
            }
            catch (parseError) {
                console.error('Error parsing container data:', parseError.message);
                return null;
            }
        })
            .filter((container) => container !== null); // Type guard for filtering nulls
    }
    catch (error) {
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
    }
    catch (error) {
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
            if (iface === 'lo')
                continue;
            try {
                const operstatePath = `${HOST_SYS}/class/net/${iface}/operstate`;
                const addressPath = `${HOST_SYS}/class/net/${iface}/address`;
                const statisticsPath = `${HOST_SYS}/class/net/${iface}/statistics`;
                if (!fs.existsSync(operstatePath))
                    continue;
                const operstate = fs.readFileSync(operstatePath, 'utf8').trim();
                const mac = fs.existsSync(addressPath)
                    ? fs.readFileSync(addressPath, 'utf8').trim()
                    : 'N/A';
                // Get IP addresses using ip command with host network namespace
                const ipOutput = (0, child_process_1.execSync)(`nsenter --net=/host/proc/1/ns/net ip addr show ${iface}`, { encoding: 'utf8' });
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
                    }
                    catch (e) {
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
            }
            catch (error) {
                console.error(`Error processing interface ${iface}:`, error.message);
            }
        }
        return interfaces;
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Uptime error:', error.message);
        return {
            raw: 0,
            formatted: '0d 0h 0m 0s'
        };
    }
}
function getDiskUsage() {
    try {
        // Get all filesystem usage, then filter for specific /dev/ devices
        const output = (0, child_process_1.execSync)('df -H', { encoding: 'utf8' });
        const lines = output.trim().split('\n');
        const filesystems = [];
        const targetDevices = ['/dev/sda2', '/dev/sdb2', '/dev/sdb3'];
        const mountPointMap = {
            '/dev/sda2': '/',
            '/dev/sdb2': '/mnt/content',
            '/dev/sdb3': '/mnt/data'
        };
        const seenDevices = new Set();
        // Skip header line and process each filesystem
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(/\s+/);
            const device = parts[0];
            // Only include specific target devices and avoid duplicates
            if (targetDevices.includes(device) && !seenDevices.has(device)) {
                seenDevices.add(device);
                const filesystem = {
                    device: device,
                    mountpoint: mountPointMap[device] || parts[5] || '/',
                    usage: parseFloat(parts[4].replace('%', '')),
                    total_gb: parts[1],
                    used_gb: parts[2],
                    available_gb: parts[3]
                };
                filesystems.push(filesystem);
            }
        }
        // Calculate totals from all filesystems
        let totalSpace = 0;
        let usedSpace = 0;
        let availableSpace = 0;
        let overallUsage = 0;
        filesystems.forEach(fs => {
            // Parse sizes for calculation (simplified - just extract numeric part)
            const totalNum = parseFloat(fs.total_gb);
            const usedNum = parseFloat(fs.used_gb);
            const availableNum = parseFloat(fs.available_gb);
            if (!isNaN(totalNum))
                totalSpace += totalNum;
            if (!isNaN(usedNum))
                usedSpace += usedNum;
            if (!isNaN(availableNum))
                availableSpace += availableNum;
        });
        // Calculate overall usage percentage
        if (totalSpace > 0) {
            overallUsage = parseFloat(((usedSpace / totalSpace) * 100).toFixed(2));
        }
        return {
            filesystems: filesystems,
            total: totalSpace,
            used: usedSpace,
            available: availableSpace,
            usage: overallUsage
        };
    }
    catch (error) {
        console.error('Disk usage error:', error.message);
        return {
            filesystems: [],
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Hostname error:', error.message);
        return 'unknown';
    }
}
function getStaticSystemInfo() {
    return {
        hostname: getHostname(),
        platform: 'Linux',
        arch: os.arch(),
        cpu: getCpuInfo()
    };
}
function getDynamicSystemInfo() {
    return {
        timestamp: Date.now(),
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
//# sourceMappingURL=systemMonitor.js.map