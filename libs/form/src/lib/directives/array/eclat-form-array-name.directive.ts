import { Directive, forwardRef, Input, OnDestroy, OnInit, SkipSelf } from '@angular/core';
import { EclatFormArray, EclatFormChild } from '../../form-models';
import { EclatFormContainerDirective } from '../eclat-form-container.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[eclatFormArrayName]',
    providers: [{
        provide: EclatFormContainerDirective,
        useExisting: forwardRef(() => EclatFormArrayNameDirective),
    }],
})
export class EclatFormArrayNameDirective<T extends any[]> extends EclatFormContainerDirective<EclatFormArray<T>> implements OnInit, OnDestroy {
    private onDestroy$: Subject<void>;
    private latestName: string;

    constructor(@SkipSelf() private parent: EclatFormContainerDirective<any>) {
        super();
        this.onDestroy$ = new Subject();
    }

    @Input()
    set eclatFormArrayName(name: string) {
        this.latestName = name;
        this._formControl.next(<EclatFormArray<any>>this.parent.getChild(name));
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

    ngOnInit(): void {
        this.parent.formControl$.pipe(takeUntil(this.onDestroy$)).subscribe(
            () => {
                this.eclatFormArrayName = this.latestName;
            },
        );
    }

    getChild(key: number): EclatFormChild<T[any]> | undefined {
        if (this.formControl) {
            return this.formControl.getChild(key);
        }

        return undefined;
    }
}

