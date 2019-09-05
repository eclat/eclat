import { Mutation } from 'apollo-angular';
import { MutationOptionsAlone } from 'apollo-angular/types';
import { FetchResult } from 'apollo-link';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { AngularDestroyable } from './angular-destroyable';
import { MutationHandlerFn } from './interface';

export class ApolloMutationExecutor<M, V extends object = {}> extends AngularDestroyable {
    public isLoading$: Observable<boolean>;
    private loadingSubject: BehaviorSubject<boolean>;

    public constructor(
        protected gql: Mutation<M, V>,
        private interceptFn?: (handler: MutationHandlerFn<M, V>, data?: V, options?: MutationOptionsAlone<M, V>) => Observable<FetchResult<M>>
    ) {
        super();
        this.loadingSubject = new BehaviorSubject<boolean>(false);
        this.isLoading$ = this.loadingSubject.asObservable();

        this.destroy$.pipe(tap(() => this.loadingSubject.complete())).subscribe()
    }

    public execute(data?: V, options?: MutationOptionsAlone<M, V>): Observable<FetchResult<M>> {
        this.loadingSubject.next(true);

        const handler: MutationHandlerFn<M, V> = (v, o) => {
            return this.gql.mutate(v, o).pipe(
                finalize(() => this.loadingSubject.next(false))
            );
        };

        return from(this.intercept(handler, data, options).toPromise())
    }

    protected intercept(handler: MutationHandlerFn<M, V>, data?: V, options?: MutationOptionsAlone<M, V>): Observable<FetchResult<M>> {
        return this.interceptFn ? this.interceptFn(handler, data, options) : handler(data, options);
    }
}
