import { MutationOptionsAlone, QueryOptionsAlone } from 'apollo-angular/types';
import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { Observable } from 'rxjs';

export type QueryHandlerFn<Q, V extends object> = (v?: V, o?: QueryOptionsAlone<V>) => Observable<ApolloQueryResult<Q>>

export type MutationHandlerFn<M, V extends object> = (v?: V, o?: MutationOptionsAlone<M, V>) => Observable<FetchResult<M>>
