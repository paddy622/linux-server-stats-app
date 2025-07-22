// CPU Information Types
export interface CpuUsage {
    usage: number;
    cores: number;
    model: string;
}

export interface CpuInfo {
    model: string;
    cores: number;
}

// Battery Information Types
export interface BatteryInfo {
    name: string;
    status: string;
    percentage: number;
    technology: string;
    voltage: number | null;
    current: number | null;
    power: number | null;
    energyFull: number | null;
    energyNow: number | null;
    timeRemaining: number | null;
}

// Memory Information Types
export interface MemoryUsage {
    total: number;
    used: number;
    free: number;
    usage: number;
}

// Docker Container Types
export interface DockerContainer {
    id: string;
    image: string;
    status: string;
    name: string;
    ports: string;
    created: string;
    size: string;
    state: string;
    networks: string;
}

// Temperature Information Types
export interface TemperatureInfo {
    cpu: number | null;
    sensors: number[];
}

// Network Information Types
export interface NetworkAddress {
    address: string;
    type: 'ipv4' | 'ipv6';
}

export interface NetworkStatistics {
    rxBytes: number;
    txBytes: number;
    rxMbps: number | null;
}

export interface NetworkInterface {
    interface: string;
    state: string;
    mac: string;
    addresses: NetworkAddress[];
    statistics: NetworkStatistics;
}

// Uptime Information Types
export interface UptimeInfo {
    raw: number;
    formatted: string;
}

// Disk Usage Types
export interface Filesystem {
    device: string;
    mountpoint: string;
    usage: number;
    total_gb: string;
    used_gb: string;
    available_gb: string;
}

export interface DiskUsage {
    filesystems: Filesystem[];
    total: number;
    used: number;
    available: number;
    usage: number;
}

// Load Average Types
export interface LoadAverage {
    '1min': number;
    '5min': number;
    '15min': number;
}

// System Information Types
export interface DynamicSystemInfo {
    timestamp: number;
    cpu: CpuUsage;
    memory: MemoryUsage;
    temperature: TemperatureInfo;
    uptime: UptimeInfo;
    network: NetworkInterface[];
    disk: DiskUsage;
    loadavg: LoadAverage;
    battery: BatteryInfo[];
    docker: DockerContainer[];
}

export interface StaticSystemInfo {
    hostname: string;
    platform: string;
    arch: string;
    cpu: CpuInfo;
}

// WebSocket Message Types
export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: number;
}

export interface StaticDataMessage extends WebSocketMessage<StaticSystemInfo> {
    type: 'static';
}

export interface DynamicDataMessage extends WebSocketMessage<DynamicSystemInfo> {
    type: 'dynamic';
}

export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: number;
    services: {
        http: 'running' | 'stopped';
        websocket?: 'running' | 'stopped';
    };
}

export interface ErrorResponse {
    error: string;
    timestamp?: number;
}

// Union types for all possible message types
export type AllWebSocketMessages =
    | StaticDataMessage
    | DynamicDataMessage;

// Utility types
export type SystemDataType = 'static' | 'dynamic';

// Configuration types
export interface RefreshInterval {
    value: number;
    label: string;
}

// Theme types
export type Theme = 'light' | 'dark';

// Component state types
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}
