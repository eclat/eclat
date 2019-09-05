import { RequestContext } from '@eclat/server';
import { AUTOCOMMIT_METADATA } from '../metadata/auto-commit.metadata';

export function AutoCommit(isTrue: boolean = true): MethodDecorator {
    return (target: object, methodName: string | symbol, descriptor: PropertyDescriptor) => {
        const originalMethod: (...args: unknown[]) => unknown = descriptor.value;

        descriptor.value = function descriptorValue(...args: unknown[]): unknown {
            RequestContext.currentRequestContext().setValue(AUTOCOMMIT_METADATA, isTrue);

            return originalMethod.apply(this, args);
        };
    };
}
