import { forkJoin, from, Observable, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { EntityManager, getConnection, QueryRunner } from 'typeorm';

export class TransactionHelper {
    private queryRunnerMap: Map<string, QueryRunner>;

    public constructor() {
        this.queryRunnerMap = new Map();
    }

    public get isAllowedAutoCommitAndRollback(): boolean {
        return this.queryRunnerMap.size <= 1;
    }

    public getManager(connectionName: string = 'default'): Observable<EntityManager> {
        let queryRunner: QueryRunner | undefined = this.queryRunnerMap.get(connectionName);

        if (queryRunner) {
            return of(queryRunner.manager);
        }

        queryRunner = getConnection(connectionName).createQueryRunner();
        this.queryRunnerMap.set(connectionName, queryRunner);

        return from(queryRunner.startTransaction()).pipe(
            mapTo(queryRunner.manager)
        );
    }

    public commit(connectionName: string): Observable<null> {
        return from(this.queryRunnerMap.get(connectionName).commitTransaction()).pipe(
            mapTo(null)
        );
    }

    public rollback(connectionName: string): Observable<null> {
        return from(this.queryRunnerMap.get(connectionName).rollbackTransaction()).pipe(
            mapTo(null)
        );
    }

    public release(connectionName: string): Observable<null> {
        return from(this.queryRunnerMap.get(connectionName).release()).pipe(
            mapTo(null)
        );
    }

    public commitAll(): Observable<null> {
        const qrs: QueryRunner[] = Array.from(this.queryRunnerMap.values());

        if (!qrs.length) {
            return of(null);
        }

        return forkJoin(
            qrs.map(qr => qr.commitTransaction())
        ).pipe(
            mapTo(null)
        );
    }

    public rollbackAll(): Observable<null> {
        const qrs: QueryRunner[] = Array.from(this.queryRunnerMap.values());

        if (!qrs.length) {
            return of(null);
        }

        return forkJoin(
            qrs.map(qr => qr.rollbackTransaction())
        ).pipe(
            mapTo(null)
        );
    }

    public releaseAll(): Observable<null> {
        const qrs: QueryRunner[] = Array.from(this.queryRunnerMap.values());

        return forkJoin(
            qrs.map(qr => qr.release())
        ).pipe(
            mapTo(null)
        );
    }
}
