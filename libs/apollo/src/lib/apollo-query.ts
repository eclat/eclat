import { Query } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { GraphQLError } from 'graphql';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';
import { AngularDestroyable } from './angular-destroyable';

export abstract class ApolloQuery<Q, V extends object = {}> extends AngularDestroyable {
    public data$: Observable<Q | null>;
    public errors$: Observable<ReadonlyArray<GraphQLError> | null>;
    public isLoading$: Observable<boolean>;
    protected result$: Observable<ApolloQueryResult<Q | null>>;
    protected readonly _resultSubject: ReplaySubject<ApolloQueryResult<Q | null>>;

    protected constructor(
        protected gql: Query<Q, V>
    ) {
        super();
        this._resultSubject = new ReplaySubject(1);
        this.result$ = this._resultSubject.pipe(
            distinctUntilChanged(),
        );
        this.data$ = this.result$.pipe(
            filter(r => !r.loading),
            map(r => r.data)
        );
        this.errors$ = this.result$.pipe(
            filter(r => !r.loading),
            map(r => r.errors || null)
        );
        this.isLoading$ = this.result$.pipe(
            map(r => r.loading)
        );
        this.destroy$.pipe(tap(() => this._resultSubject.complete())).subscribe();
    }
}
