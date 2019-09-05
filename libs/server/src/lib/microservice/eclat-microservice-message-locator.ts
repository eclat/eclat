import { Type } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

type HandlerType = 'event' | 'query' | 'mutation';

const locatorMap: Map<string, [HandlerType, Type<object>, Type<unknown>]> = new Map();

export function QueryHandler(message: Type<object>, returnType: Type<unknown>): ClassDecorator {
    return target => {
        const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target.prototype, 'handle');

        if (!descriptor) {
            throw new Error('should be defined');
        }

        MessagePattern(message.name)(target, 'handle', descriptor);
        locatorMap.set(message.name, ['query', message, returnType]);

        return target;
    };
}

export function MutationHandler(message: Type<object>, returnType: Type<unknown>): ClassDecorator {
    return target => {
        const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target.prototype, 'handle');

        if (!descriptor) {
            throw new Error('should be defined');
        }

        MessagePattern(message.name)(target, 'handle', descriptor);
        locatorMap.set(message.name, ['mutation', message, returnType]);

        return target;
    };
}

export function EventHandler(message: Type<object>, returnType: Type<unknown>): ClassDecorator {
    return target => {
        const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target.prototype, 'handle');

        if (!descriptor) {
            throw new Error('should be defined');
        }

        EventPattern(message.name)(target, 'handle', descriptor);
        locatorMap.set(message.name, ['event', message, returnType]);

        return target;
    };
}

// tslint:disable:no-non-null-assertion
export function getHandlerTypeByName(messageName: string): HandlerType {
    return locatorMap.get(messageName)![0];
}

export function getMessageClassByName(messageName: string): Type<any> {
    return locatorMap.get(messageName)![1];
}

export function getReturnTypeByName(messageName: string): Type<unknown> {
    return locatorMap.get(messageName)![2];
}
