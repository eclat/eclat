import { createNamespace, getNamespace, Namespace } from 'cls-hooked';
import { from, Observable } from 'rxjs';

// @dynamic
export class RequestContext {
    public readonly id: number;
    private readonly map: Map<string | symbol, any>;

    protected constructor(initialData: object = {}) {
        this.id = Math.random();
        this.map = new Map(
            Object.getOwnPropertyNames(initialData).reduce(
                (acc, cur) => {
                    acc.push([cur, initialData[cur]]);
                    return acc;
                }, Object.getOwnPropertySymbols(initialData).reduce(
                    (acc, cur) => {
                        acc.push([cur, initialData[cur]]);
                        return acc;
                    }, []
                )
            )
        );
    }

    public static runInContext<T>(
        obsFn: () => Promise<Observable<T>>,
        initialData: object = {}
    ): Observable<T> {
        return from<Promise<T>>(
            new Promise((resolve, reject) => {
                const session: Namespace = getNamespace(RequestContext.name) || createNamespace(RequestContext.name);

                session.run(async () => {
                    session.set(RequestContext.name, new RequestContext(initialData));
                    try {
                        resolve((await obsFn()).toPromise());
                    } catch (e) {
                        reject(e);
                    }
                });
            })
        );
    }

    public static currentRequestContext(): RequestContext {
        const session: Namespace = getNamespace(RequestContext.name);
        if (session && session.active) {
            return session.get(RequestContext.name);
        }

        throw new Error('Request context not found');
    }

    public setValue<T>(key: string | symbol, value: T extends undefined ? never : T): void {
        if (typeof value === 'undefined') {
            throw new Error('Please use null instead');
        }
        this.map.set(key, value);
    }

    public getValue<T>(key: string | symbol): T {
        const value: T = this.map.get(key);

        if (typeof value === 'undefined') {
            throw new Error(`The value for ${key.toString()} has not been set before`);
        }

        return value;
    }
}
