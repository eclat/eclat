import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { EntityManager } from 'typeorm';
import { Memoize } from '../../+common/memoize';
import { DuckType } from '../../+common/types';
import { RequestContext } from '../../request-context/request-context';
import { CONNECTION_METADATA } from '../metadata/connection.metadata';
import { TRANSACTION_METADATA } from '../metadata/transaction.metadata';
import { TransactionHelper } from '../transaction/transaction-helper';

@Injectable()
export abstract class AbstractRepository<T> {
    protected abstract entity: DuckType<T>;

    protected get manager$(): Observable<EntityManager> {
        return this.transactionHelper.getManager(this.connectionName);
    }

    @Memoize()
    protected get connectionName(): string {
        return Reflect.getMetadata(CONNECTION_METADATA, this.entity) || 'default';
    }

    protected get transactionHelper(): TransactionHelper {
        return RequestContext.currentRequestContext().getValue(TRANSACTION_METADATA);
    }

    public save(entities: T[]): Observable<T[]>;

    public save(entity: T): Observable<T>;

    public save(entityOrEntities: T | T[]): Observable<T | T[]> {
        return this.manager$.pipe(
            mergeMap(manager => manager.save(entityOrEntities))
        );
    }

    public remove(entities: T[]): Observable<T[]>;

    public remove(entity: T): Observable<T>;

    public remove(entityOrEntities: T | T[]): Observable<T | T[]> {
        return this.manager$.pipe(
            mergeMap(manager => manager.remove(entityOrEntities))
        );
    }
}
