export interface CpuUsage {
    usage: number;
    cores: number;
    model: string;
}
export interface CpuInfo {
    model: string;
    cores: number;
}
export interface CpuDynamic {
    usage: number;
}
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
export interface MemoryUsage {
    total: number;
    used: number;
    free: number;
    usage: number;
}
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
export interface TemperatureInfo {
    cpu: number | null;
    sensors: number[];
}
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
export interface UptimeInfo {
    raw: number;
    formatted: string;
}
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
export interface LoadAverage {
    '1min': number;
    '5min': number;
    '15min': number;
}
export interface SystemInfo {
    timestamp: number;
    hostname: string;
    platform: string;
    arch: string;
    cpu: CpuUsage;
    memory: MemoryUsage;
    temperature: TemperatureInfo;
    uptime: UptimeInfo;
    network: NetworkInterface[];
    disk: DiskUsage;
    loadavg: LoadAverage;
    battery: BatteryInfo[] | null;
    docker: DockerContainer[];
}
export interface StaticSystemInfo {
    hostname: string;
    platform: string;
    arch: string;
    cpu: CpuInfo;
}
export interface DynamicSystemInfo {
    timestamp: number;
    cpu: CpuDynamic;
    memory: MemoryUsage;
    temperature: TemperatureInfo;
    uptime: UptimeInfo;
    network: NetworkInterface[];
    disk: DiskUsage;
    loadavg: LoadAverage;
    battery: BatteryInfo[] | null;
    docker: DockerContainer[];
}
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
export interface SystemDataMessage extends WebSocketMessage<SystemInfo> {
    type: 'system';
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
export type AllWebSocketMessages = StaticDataMessage | DynamicDataMessage | SystemDataMessage;
export type SystemDataType = 'static' | 'dynamic' | 'system';
export interface RefreshInterval {
    value: number;
    label: string;
}
export type Theme = 'light' | 'dark';
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}
//# sourceMappingURL=index.d.ts.map