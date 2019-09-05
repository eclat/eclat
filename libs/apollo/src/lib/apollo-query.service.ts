import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import { ApolloQueryResult, NetworkStatus } from 'apollo-client';
import { GraphQLError } from 'graphql';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AngularDestroyable } from './angular-destroyable';

@Injectable()
export abstract class ApolloQuery<Q, V extends object, P> extends AngularDestroyable {
    public params$: Observable<P | null>;
    public data$: Observable<Q | null>;
    public errors$: Observable<ReadonlyArray<GraphQLError> | null>;
    public isLoading$: Observable<boolean>;

    protected readonly _resultSubject: BehaviorSubject<ApolloQueryResult<Q | null>>;
    protected readonly _paramsSubject: BehaviorSubject<P | null>;

    public constructor(
        protected gql: Query<Q, V>,
        protected transformer: () => (params: P) => Observable<V>
    ) {
        super();
        this._resultSubject = new BehaviorSubject<ApolloQueryResult<Q | null>>({
            data: null,
            loading: false,
            networkStatus: NetworkStatus.ready,
            stale: false
        });
        this._paramsSubject = new BehaviorSubject<P | null>(null);

        this.params$ = this._paramsSubject.pipe(distinctUntilChanged());
        this.data$ = this._resultSubject.pipe(
            map(r => r.data),
            distinctUntilChanged()
        );
        this.errors$ = this._resultSubject.pipe(
            map(r => r.errors || null),
            distinctUntilChanged()
        );
        this.isLoading$ = this._resultSubject.pipe(
            map(r => r.loading),
            distinctUntilChanged()
        );
    }
}
