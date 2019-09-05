import { Injectable } from '@angular/core';
import { NetworkStatus } from 'apollo-client';
import { of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { ApolloQuery } from './apollo-query.service';

@Injectable()
export abstract class ApolloQueryFetcher<Q, V extends object, P> extends ApolloQuery<Q, V, P> {
    public fetch(params: P): void {
        of(params)
            .pipe(
                mergeMap(this.transformer()),
                tap(() => {
                    this._paramsSubject.next(params);
                    this._resultSubject.next({
                        data: null,
                        loading: true,
                        networkStatus: NetworkStatus.loading,
                        stale: true
                    });
                }),
                mergeMap(variables => this.gql.fetch(variables)),
                tap(result => this._resultSubject.next(result))
            )
            .subscribe();
    }
}
