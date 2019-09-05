import { RequestContext } from '@eclat/server';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, mapTo, mergeMap, mergeMapTo, tap } from 'rxjs/operators';
import { AUTOCOMMIT_METADATA } from '../metadata/auto-commit.metadata';
import { TRANSACTION_METADATA } from '../metadata/transaction.metadata';
import { TransactionHelper } from './transaction-helper';

@Injectable()
export class TransactionManagerInterceptor implements NestInterceptor {

    protected get isAutoCommitHandler(): boolean {
        try {
            return RequestContext.currentRequestContext().getValue(AUTOCOMMIT_METADATA);
        } catch (e) {
            return true;
        }
    }

    public intercept(payload: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const helper: TransactionHelper = new TransactionHelper();

        RequestContext.currentRequestContext().setValue(TRANSACTION_METADATA, helper);

        return next.handle().pipe(
            mergeMap(
                result => {
                    if (!this.isAutoCommitHandler) {
                        return of(result);
                    }

                    if (helper.isAllowedAutoCommitAndRollback) {
                        return helper.commitAll().pipe(mapTo(result));
                    }

                    throw new Error('should manually commit');
                }
            ),
            catchError(
                err => {
                    if (!this.isAutoCommitHandler) {
                        return throwError(err);
                    }

                    if (helper.isAllowedAutoCommitAndRollback) {
                        return helper.rollbackAll().pipe(mergeMapTo(throwError(err)));
                    }

                    throw new Error('should manually rollback');
                }
            ),
            tap(console.log, console.log),
            finalize(
                () => {
                    return helper.releaseAll();
                }
            )
        );
    }
}
