import { ActivatedRoute, Params, Router } from '@angular/router';
import { Query } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { forkJoin, merge, of, Observable } from 'rxjs';
import { first, map, mergeMap, skip, startWith, takeUntil } from 'rxjs/operators';
import { ApolloQueryWatcher } from './apollo-query-watcher';
import { QueryHandlerFn } from './interface';

export abstract class ApolloQueryRouterWatcher<Q, V extends object, P extends Record<string, string>> extends ApolloQueryWatcher<Q, V> {
    protected constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected gql: Query<Q, V>
    ) {
        super(gql);
        merge(of(null), this.route.queryParams.pipe(skip(1)), this.route.params.pipe(skip(1))).pipe(
            takeUntil(this.destroy$),
            mergeMap(() => super.refetch())
        ).subscribe();
    }

    public refetch(data?: V): Observable<ApolloQueryResult<Q>> {
        throw new Error('use query params instead');
    }

    public updateQuery(reducer: (query: P) => P): void {
        this.route.queryParams.pipe(
            first(),
            map(p => reducer(p as P)),
            mergeMap(queryParams => {
                return this.router.navigate(
                    [],
                    {
                        relativeTo: this.route,
                        queryParams
                    });
            })
        ).subscribe();
    }

    protected intercept(handler: QueryHandlerFn<Q, V>, data?: V): Observable<ApolloQueryResult<Q>> {
        return forkJoin({
            query: this.route.queryParams.pipe(first()),
            params: this.route.params.pipe(first())
        }).pipe(
            mergeMap(({ query, params }) => this.transformer()(query as P, params)),
            mergeMap(v => super.intercept(handler, v))
        );
    }

    protected abstract transformer(): (query: P, params: Params) => Observable<V>;
}
