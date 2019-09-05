import { Directive, forwardRef, Input } from '@angular/core';
import { EclatFormChild, EclatFormGroup } from '../../form-models';
import { EclatFormContainerDirective } from '../eclat-form-container.directive';

@Directive({
    selector: '[eclatFormGroup]',
    providers: [{
        provide: EclatFormContainerDirective,
        useExisting: forwardRef(() => EclatFormGroupDirective),
    }],
})
export class EclatFormGroupDirective<T> extends EclatFormContainerDirective<EclatFormGroup<T>> {
    constructor() {
        super();
    }

    @Input()
    set eclatFormGroup(formGroup: EclatFormGroup<T>) {
        this._formControl.next(formGroup);
    }

    getChild(key: keyof T): EclatFormChild<T[any]> | undefined {
        if (this.formControl) {
            return this.formControl.getChild(key);
        }

        return undefined;
    }
}

