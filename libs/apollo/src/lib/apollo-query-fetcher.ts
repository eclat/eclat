import { Query } from 'apollo-angular';
import { QueryOptionsAlone } from 'apollo-angular/types';
import { ApolloQueryResult, NetworkStatus } from 'apollo-client';
import { Observable } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';
import { ApolloQuery } from './apollo-query';
import { QueryHandlerFn } from './interface';

export abstract class ApolloQueryFetcher<Q, V extends object = {}> extends ApolloQuery<Q, V> {
    protected constructor(
        protected gql: Query<Q, V>,
        private interceptFn?: (handler: QueryHandlerFn<Q, V>, data?: V, options?: QueryOptionsAlone<V>) => Observable<ApolloQueryResult<Q>>
    ) {
        super(gql);
    }

    public fetch(data?: V, options?: QueryOptionsAlone<V>): void {
        this._resultSubject.next({
            data: null,
            loading: true,
            networkStatus: NetworkStatus.loading,
            stale: true
        });

        const handler: QueryHandlerFn<Q, V> = variables => {
            return this.gql.fetch(variables, options).pipe(
                tap(result => this._resultSubject.next(result)),
            );
        };

        this.intercept(handler, data, options).subscribe();
    }

    protected intercept(handler: QueryHandlerFn<Q, V>, data?: V, options?: QueryOptionsAlone<V>): Observable<ApolloQueryResult<Q>> {
        return this.interceptFn ? this.interceptFn(handler, data, options) : handler(data, options);
    }
}
