# Shared Types Package

This package contains TypeScript type definitions shared between the Linux Server Stats frontend and backend applications.

## Installation

```bash
npm install
npm run build
```

## Usage

In your TypeScript files:

```typescript
import { 
  SystemInfo, 
  DynamicSystemInfo, 
  StaticSystemInfo,
  WebSocketMessage 
} from '@linux-server-stats/shared-types';
```

## Available Types

### Core System Types
- `SystemInfo` - Complete system information
- `StaticSystemInfo` - Static system information (hostname, CPU model, etc.)
- `DynamicSystemInfo` - Dynamic system information (usage, stats, etc.)

### Component Types
- `CpuUsage`, `CpuInfo`, `CpuDynamic` - CPU related information
- `MemoryUsage` - Memory usage statistics
- `BatteryInfo` - Battery information
- `DockerContainer` - Docker container information
- `NetworkInterface`, `NetworkAddress` - Network interface details
- `DiskUsage`, `Filesystem` - Disk usage information
- `TemperatureInfo` - System temperature data
- `LoadAverage` - System load averages
- `UptimeInfo` - System uptime information

### Communication Types
- `WebSocketMessage<T>` - Base WebSocket message structure
- `StaticDataMessage`, `DynamicDataMessage`, `SystemDataMessage` - Specific message types
- `HealthCheckResponse` - Health check API response
- `ErrorResponse` - Error response structure

### Utility Types
- `Theme` - Application theme type
- `RefreshInterval` - Refresh interval configuration
- `LoadingState` - Component loading state

## Development

To rebuild the types:

```bash
npm run build
```

To watch for changes:

```bash
npm run watch
```

To clean the build directory:

```bash
npm run clean
```
