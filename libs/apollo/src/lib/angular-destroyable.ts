import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export class AngularDestroyable implements OnDestroy {
    public destroy$: Observable<boolean>;
    private destroySubject: Subject<boolean>;

    public constructor() {
        this.destroySubject = new Subject();
        this.destroy$ = this.destroySubject.asObservable();
    }

    public ngOnDestroy(): void {
        this.destroySubject.next(true);
        this.destroySubject.complete();
    }
}
