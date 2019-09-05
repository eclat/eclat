import { Query, QueryRef } from 'apollo-angular';
import { QueryOptionsAlone } from 'apollo-angular/types';
import { ApolloQueryResult } from 'apollo-client';
import { from, Observable, of } from 'rxjs';
import { filter, first, takeUntil, tap, mergeMap } from 'rxjs/operators';
import { ApolloQuery } from './apollo-query';
import { QueryHandlerFn } from './interface';

export abstract class ApolloQueryWatcher<Q, V extends object = {}> extends ApolloQuery<Q, V> {
    protected queryRef?: QueryRef<Q, V>;

    protected constructor(
        protected gql: Query<Q, V>,
        private interceptFn?: (handler: QueryHandlerFn<Q, V>, data?: V, options?: QueryOptionsAlone<V>) => Observable<ApolloQueryResult<Q>>
    ) {
        super(gql);
    }

    public refetch(variables?: V, options?: QueryOptionsAlone<V>): Observable<ApolloQueryResult<Q>> {
        const handler: QueryHandlerFn<Q, V> = (v, o = {}) => {
            if (this.queryRef) {
                return of(this.queryRef).pipe(
                    mergeMap(qr => qr.setOptions(o).then(() => qr)),
                    mergeMap(qr => qr.refetch(v)),
                )
            }

            this.queryRef = this.gql.watch(v, o);
            this.queryRef.valueChanges
                .pipe(
                    tap(result => this._resultSubject.next(result)),
                    takeUntil(this.destroy$)
                )
                .subscribe();

            return this.queryRef.valueChanges.pipe(filter(({loading}) => !loading), first());
        };

        return this.intercept(handler, variables, options);
    }

    protected intercept(handler: QueryHandlerFn<Q, V>, data?: V, options?: QueryOptionsAlone<V>): Observable<ApolloQueryResult<Q>> {
        return this.interceptFn ? this.interceptFn(handler, data, options) : handler(data, options);
    }
}
