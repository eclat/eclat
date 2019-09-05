import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { Memoize } from '../../+common/memoize';
import { DuckType } from '../../+common/types';
import { RequestContext } from '../../request-context/request-context';
import { CONNECTION_METADATA } from '../metadata/connection.metadata';
import { TRANSACTION_METADATA } from '../metadata/transaction.metadata';
import { TransactionHelper } from '../transaction/transaction-helper';

@Injectable()
export abstract class QueryExecutor<T> {
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

    public execute<R>(resolver: (qb: SelectQueryBuilder<T>) => Promise<R>, alias: string = 'model'): Observable<R> {
        return this.manager$.pipe(
            mergeMap(manager => resolver(manager.createQueryBuilder(this.entity, alias)))
        );
    }
}
