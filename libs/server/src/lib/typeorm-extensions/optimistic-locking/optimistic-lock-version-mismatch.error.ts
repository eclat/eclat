export class OptimisticLockVersionMismatchError extends Error {
    public readonly name: string = 'OptimisticLockVersionMismatchError';

    public constructor(entity: string, expectedVersion: number, actualVersion: number) {
        super();
        Reflect.setPrototypeOf(this, OptimisticLockVersionMismatchError.prototype);
        // tslint:disable-next-line
        this.message = `The optimistic lock on entity ${entity} failed, version ${expectedVersion} was expected, but is actually ${actualVersion}.`;
    }
}
