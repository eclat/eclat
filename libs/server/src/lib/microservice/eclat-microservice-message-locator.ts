import { Type } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

export enum HandlerType {
    EVENT = 'event',
    QUERY = 'query',
    MUTATION = 'mutation',
}

interface HandlerOptions<M = unknown, R = unknown> {
    messageType: Type<M>;
    returnType: Type<R>;
}

export type HandlerSpec<M = unknown, R = unknown> = { type: string } & HandlerOptions<M, R>;

const locatorMap: Map<string, HandlerSpec> = new Map();

export function QueryHandler(options: HandlerOptions): ClassDecorator {
    return target => {
        const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target.prototype, 'handle');

        if (!descriptor) {
            throw new Error('should be defined');
        }

        MessagePattern(options.messageType.name)(target, 'handle', descriptor);
        locatorMap.set(options.messageType.name, { type: HandlerType.QUERY, ...options });

        return target;
    };
}

export function MutationHandler(options: HandlerOptions): ClassDecorator {
    return target => {
        const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target.prototype, 'handle');

        if (!descriptor) {
            throw new Error('should be defined');
        }

        MessagePattern(options.messageType.name)(target, 'handle', descriptor);
        locatorMap.set(options.messageType.name, { type: HandlerType.MUTATION, ...options });

        return target;
    };
}

export function EventHandler(options: HandlerOptions): ClassDecorator {
    return target => {
        const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target.prototype, 'handle');

        if (!descriptor) {
            throw new Error('should be defined');
        }

        EventPattern(options.messageType.name)(target, 'handle', descriptor);
        locatorMap.set(options.messageType.name, { type: HandlerType.EVENT, ...options });

        return target;
    };
}

export function getHandlerSpecByName<M, R>(messageName: string): HandlerSpec<M, R> {
    return locatorMap.get(messageName) as HandlerSpec<M, R>;
}
