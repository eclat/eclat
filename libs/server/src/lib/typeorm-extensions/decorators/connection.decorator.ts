import { CONNECTION_METADATA } from '../metadata/connection.metadata';

export function Connection(connectionName: string = 'default'): ClassDecorator {
    return target => {
        Reflect.defineMetadata(CONNECTION_METADATA, connectionName, target);
    };
}
