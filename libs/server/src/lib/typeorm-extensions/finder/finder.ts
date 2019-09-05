import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { EntityManager, FindManyOptions, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { Memoize } from '../../+common/memoize';
import { DuckType } from '../../+common/types';
import { RequestContext } from '../../request-context/request-context';
import { CONNECTION_METADATA } from '../metadata/connection.metadata';
import { TRANSACTION_METADATA } from '../metadata/transaction.metadata';
import { TransactionHelper } from '../transaction/transaction-helper';

@Injectable()
export abstract class Finder<T> {
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

    public findOneOrFail(options?: FindOneOptions<T>): Observable<T> {
        return this.manager$.pipe(
            mergeMap(manager => manager.findOneOrFail(this.entity, options))
        );
    }

    public findOne(options?: FindOneOptions<T>): Observable<T> {
        return this.manager$.pipe(
            mergeMap(manager => manager.findOne(this.entity, options))
        );
    }

    public findAndCount(options?: FindManyOptions<T>): Observable<[T[], number]> {
        return this.manager$.pipe(
            mergeMap(manager => manager.findAndCount(this.entity, options))
        );
    }

    public find(options?: FindManyOptions<T>): Observable<T[]> {
        return this.manager$.pipe(
            mergeMap(manager => manager.find(this.entity, options))
        );
    }
}
