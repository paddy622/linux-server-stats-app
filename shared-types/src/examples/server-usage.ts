// Example usage of shared types in server
import {
    DynamicSystemInfo,
    DynamicSystemInfo,
    StaticSystemInfo,
    WebSocketMessage,
    SystemDataMessage,
    StaticDataMessage,
    DynamicDataMessage
} from '../index';

// Example function showing how to type system data
export function createSystemDataMessage(systemInfo: DynamicSystemInfo): SystemDataMessage {
    return {
        type: 'system',
        data: systemInfo,
        timestamp: Date.now()
    };
}

export function createStaticDataMessage(staticInfo: StaticSystemInfo): StaticDataMessage {
    return {
        type: 'static',
        data: staticInfo,
        timestamp: Date.now()
    };
}

export function createDynamicDataMessage(dynamicInfo: DynamicSystemInfo): DynamicDataMessage {
    return {
        type: 'dynamic',
        data: dynamicInfo,
        timestamp: Date.now()
    };
}

// Type guard to check message type
export function isSystemDataMessage(message: WebSocketMessage): message is SystemDataMessage {
    return message.type === 'system';
}

export function isStaticDataMessage(message: WebSocketMessage): message is StaticDataMessage {
    return message.type === 'static';
}

export function isDynamicDataMessage(message: WebSocketMessage): message is DynamicDataMessage {
    return message.type === 'dynamic';
}
