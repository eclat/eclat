import { Directive, forwardRef, Input, OnDestroy, OnInit, SkipSelf } from '@angular/core';
import { EclatFormChild, EclatFormGroup } from '../../form-models';
import { EclatFormContainerDirective } from '../eclat-form-container.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[eclatFormGroupName]',
    providers: [{
        provide: EclatFormContainerDirective,
        useExisting: forwardRef(() => EclatFormGroupNameDirective),
    }],
})
export class EclatFormGroupNameDirective<T extends any[]> extends EclatFormContainerDirective<EclatFormGroup<T>> implements OnInit, OnDestroy {
    private onDestroy$: Subject<void>;
    private latestName: string;

    constructor(@SkipSelf() private parent: EclatFormContainerDirective<any>) {
        super();
        this.onDestroy$ = new Subject();
    }

    @Input()
    set eclatFormGroupName(name: string) {
        this.latestName = name;
        this._formControl.next(<EclatFormGroup<any>>this.parent.getChild(name));
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

    ngOnInit(): void {
        this.parent.formControl$.pipe(takeUntil(this.onDestroy$)).subscribe(
            () => {
                this.eclatFormGroupName = this.latestName;
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

