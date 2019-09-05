// NOTE: https://github.com/typeorm/typeorm/issues/3608

import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { OptimisticLockVersionMismatchError } from './optimistic-lock-version-mismatch.error';

const EXPECTED_VERSION_METADATA: symbol = Symbol();

@Injectable()
export class OptimisticLockingSubscriber<T extends object = object> implements EntitySubscriberInterface {
    public constructor(@InjectConnection() connection: Connection) {
        connection.subscribers.push(this);
    }

    public beforeUpdate(event: UpdateEvent<T>): void {
        if (event.entity && event.metadata.versionColumn) {
            const currentVersion: number = Reflect.get(event.entity, event.metadata.versionColumn.propertyName);

            Reflect.defineMetadata(EXPECTED_VERSION_METADATA, currentVersion + 1, event.entity);
        }
    }

    public afterUpdate(event: UpdateEvent<T>): void {
        if (event.entity && event.metadata.versionColumn) {
            const expectedVersion: number = Reflect.getOwnMetadata(EXPECTED_VERSION_METADATA, event.entity);

            Reflect.deleteMetadata(EXPECTED_VERSION_METADATA, event.entity);

            const actualVersion: number = Reflect.get(event.entity, event.metadata.versionColumn.propertyName);

            if (expectedVersion !== actualVersion) {
                throw new OptimisticLockVersionMismatchError(
                    event.entity.constructor.name,
                    expectedVersion,
                    actualVersion
                );
            }
        }
    }
}
