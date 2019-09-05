import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { Directive, forwardRef, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { EclatFormGroup } from '../../form-models';

@Directive({
    selector: '[eclatFormGroup]',
    providers: [{
        provide: ControlContainer,
        useExisting: forwardRef(() => EclatFormGroupBinderDirective),
    }],
})
export class EclatFormGroupBinderDirective<T> extends FormGroupDirective implements OnChanges {
    @Input()
    set eclatFormGroup(formGroup: EclatFormGroup<T>) {
        this.form = formGroup.control;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const eclatFormGroupChanges = changes.eclatFormGroup;

        if (eclatFormGroupChanges) {
            const prevValue = eclatFormGroupChanges.previousValue ? eclatFormGroupChanges.previousValue.control : undefined;
            const currentValue = eclatFormGroupChanges.currentValue.control;
            const firstChange = eclatFormGroupChanges.firstChange;
            super.ngOnChanges({ form: new SimpleChange(prevValue, currentValue, firstChange) });
        }
    }
}
