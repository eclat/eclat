import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { WatchQueryOptionsAlone } from 'apollo-angular/types';
import { BehaviorSubject, of } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { ApolloQuery } from './apollo-query.service';

@Injectable()
export abstract class ApolloQueryWatcher<Q, V extends object, P> extends ApolloQuery<Q, V, P> {
    private _queryRef?: QueryRef<Q, V>;
    private hasCalled: boolean = false;

    private _fetcherSubject?: BehaviorSubject<P>;

    private get fetcherSubject(): BehaviorSubject<P> {
        if (!this._fetcherSubject) {
            throw new Error('watcher not started');
        }

        return this._fetcherSubject;
    }

    public refetch(paramsOrFn?: P | ((oldParams: P) => P)): void {
        const subject: BehaviorSubject<P> = this.fetcherSubject;

        subject.next(
            paramsOrFn instanceof Function ? paramsOrFn(subject.getValue()) : paramsOrFn || subject.getValue()
        );
    }

    public watch(initialParams: P, options: WatchQueryOptionsAlone<V> = {}): void {
        if (this.hasCalled) {
            throw new Error('only need watch once');
        }
        this.hasCalled = true;

        this._fetcherSubject = new BehaviorSubject(initialParams);

        const fetch: (variables: V) => void = variables => {
            if (this._queryRef) {
                this._queryRef.refetch(variables);
            } else {
                this._queryRef = this.gql.watch(variables, options);
                this._queryRef.valueChanges
                    .pipe(
                        tap(result => this._resultSubject.next(result)),
                        takeUntil(this.destroy$)
                    )
                    .subscribe();
            }
        };

        this._fetcherSubject
            .pipe(
                tap(params => this._paramsSubject.next(params)),
                mergeMap(this.transformer()),
                tap(variables => fetch(variables)),
                takeUntil(this.destroy$)
            )
            .subscribe();
    }
}
