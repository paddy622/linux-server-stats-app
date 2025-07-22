// Example usage of shared types in server
import {
    DynamicSystemInfo,
    StaticSystemInfo,
    WebSocketMessage,
    StaticDataMessage,
    DynamicDataMessage
} from '../index';

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

export function isStaticDataMessage(message: WebSocketMessage): message is StaticDataMessage {
    return message.type === 'static';
}

export function isDynamicDataMessage(message: WebSocketMessage): message is DynamicDataMessage {
    return message.type === 'dynamic';
}
