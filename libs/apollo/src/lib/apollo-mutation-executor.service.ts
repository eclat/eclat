import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import { FetchResult } from 'apollo-link';
import { GraphQLError } from 'graphql';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, mergeMap, takeUntil } from 'rxjs/operators';
import { AngularDestroyable } from './angular-destroyable';

@Injectable()
export class ApolloMutationExecutorService<M, V extends object> extends AngularDestroyable {
    public isLoading$: Observable<boolean>;
    private loadingSubject: BehaviorSubject<boolean>;

    public constructor(
        protected gql: Mutation<M, V>,
        protected handleSuccess: () => (result: FetchResult<M>) => Observable<null> = () => () => of(null),
        protected handleError: () => (result: ReadonlyArray<GraphQLError>) => Observable<null> = () => () => of(null)
    ) {
        super();
        this.loadingSubject = new BehaviorSubject<boolean>(false);
        this.isLoading$ = this.loadingSubject.asObservable().pipe(takeUntil(this.destroy$));
    }

    public execute(data: V): void {
        this.loadingSubject.next(true);

        this.gql
            .mutate(data)
            .pipe(
                map(result => {
                    if (result.errors) {
                        throw result.errors;
                    }

                    return result;
                }),
                mergeMap(this.handleSuccess()),
                catchError(this.handleError()),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe();
    }
}
